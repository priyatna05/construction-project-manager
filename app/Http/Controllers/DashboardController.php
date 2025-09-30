<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Comment;
use App\Models\Project;
use App\Services\PermissionService;
use Illuminate\Support\Facades\Auth;
use App\Services\EvmCalculationService;
use App\Services\CriticalPathService;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $projectIds = PermissionService::projectsThatUserCanAccess(Auth::user())->pluck('id');

        // Fetch projects with client company and task counts
        $projects = Project::whereIn('id', $projectIds)
            ->with(['clientCompany:id,name'])
            ->withCount([
                'tasks AS all_tasks_count',
                'tasks AS completed_tasks_count',
                'tasks AS overdue_tasks_count',
            ])
            ->withExists('favoritedByAuthUser AS favorite')
            ->orderBy('favorite', 'desc')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'budget_project', 'pv', 'ev', 'ac', 'original_duration_days', 'start_date']);

        // Calculate metrics for each project using EvmCalculationService instance
        $evmService = new EvmCalculationService();
        $projects = $projects->map(function ($project) use ($evmService) {
            $metrics = $evmService->calculateMetrics($project);
            return $metrics;
        });

        // Calculate critical path tasks dynamically using CriticalPathService
        $criticalPathService = new CriticalPathService();
        $criticalPathTasks = collect();
        foreach ($projectIds as $projectId) {
            $criticalPathTasks = $criticalPathTasks->merge($criticalPathService->calculateCriticalPath($projectId));
        }

        // Fetch team members as users assigned to tasks in the projects
        $teamMembers = \App\Models\User::whereHas('subscribedToTasks', function ($query) use ($projectIds) {
                $query->whereIn('project_id', $projectIds);
            })
            ->withCount(['subscribedToTasks as tasks_count' => function ($query) use ($projectIds) {
                $query->whereIn('project_id', $projectIds);
            }])
            ->get(['id', 'name']);

        // Fetch calendar events derived from tasks with due dates
        $calendarEvents = Task::whereIn('project_id', $projectIds)
            ->whereNotNull('end_date')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'type' => 'task',
                    'title' => $task->name,
                    'date' => $task->end_date,
                ];
            });

        return Inertia::render('Dashboard/Index', [
            'projects' => $projects,
            'criticalPathTasks' => $criticalPathTasks,
            'teamMembers' => $teamMembers,
            'calendarEvents' => $calendarEvents,
            'overdueTasks' => Task::whereIn('project_id', $projectIds)
                ->where('assigned_to_user_id', Auth::id())
                ->with('project:id,name')
                ->with('taskGroup:id,name')
                ->get(['id', 'name', 'group_id', 'project_id']),
            'recentlyAssignedTasks' => Task::whereIn('project_id', $projectIds)
                ->whereNotNull('assigned_at')
                ->where('assigned_to_user_id', Auth::id())
                ->with('project:id,name')
                ->with('taskGroup:id,name')
                ->orderBy('assigned_at')
                ->limit(10)
                ->get(['id', 'name', 'assigned_at', 'group_id', 'project_id']),
            'recentComments' => Comment::query()
                ->whereHas('task', function ($query) use ($projectIds) {
                    $query->whereIn('project_id', $projectIds)
                        ->where('assigned_to_user_id', Auth::id());
                })
                ->with([
                    'task:id,name,project_id',
                    'task.project:id,name',
                    'user:id,name',
                ])
                ->latest()
                ->get(),
        ]);
    }
}
