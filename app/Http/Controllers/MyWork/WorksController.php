<?php

namespace App\Http\Controllers\MyWork;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Project;
use App\Models\Task;
use App\Services\PermissionService;
use Inertia\Inertia;
use Inertia\Response;

class WorksController extends Controller
{
    public function index(): Response
    {
        /** @var \App\Models\User */
        $user = auth()->user();
        $projects = PermissionService::projectsThatUserCanAccess($user);
        $projectIds = $projects->pluck('id');

        $baseTasksQuery = Task::query()
            ->whereIn('project_id', $projectIds)
            ->when(
                $user->hasRole('client'),
                fn ($query) => $query->where('hidden_from_clients', false)
            )
            ->where('assigned_to_user_id', $user->id);

        $openTasksQuery = (clone $baseTasksQuery)->whereNull('completed_at');

        $today = now()->startOfDay();
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();
        $lastSevenDays = now()->subDays(7);

        $stats = [
            'open_tasks' => (clone $openTasksQuery)->count(),
            'overdue_tasks' => (clone $openTasksQuery)
                ->whereNotNull('end_date')
                ->whereDate('end_date', '<', $today)
                ->count(),
            'due_today' => (clone $openTasksQuery)
                ->whereDate('end_date', $today)
                ->count(),
            'due_this_week' => (clone $openTasksQuery)
                ->whereNotNull('end_date')
                ->whereBetween('end_date', [$today->toDateString(), $endOfWeek->toDateString()])
                ->count(),
            'no_due_date' => (clone $openTasksQuery)
                ->whereNull('end_date')
                ->count(),
            'completed_this_week' => (clone $baseTasksQuery)
                ->whereNotNull('completed_at')
                ->whereBetween('completed_at', [$startOfWeek, $endOfWeek])
                ->count(),
            'active_projects' => (clone $openTasksQuery)
                ->distinct('project_id')
                ->count('project_id'),
            'activity_last_7_days' => Activity::whereIn('project_id', $projectIds)
                ->where('created_at', '>=', $lastSevenDays)
                ->count(),
        ];

        $upcomingTasks = (clone $openTasksQuery)
            ->whereNotNull('end_date')
            ->orderBy('end_date')
            ->limit(6)
            ->with([
                'project:id,name',
                'taskGroup:id,name',
                'labels:id,name,color',
            ])
            ->get([
                'id',
                'project_id',
                'group_id',
                'assigned_to_user_id',
                'number',
                'name',
                'start_date',
                'end_date',
                'completed_at',
            ]);

        $recentActivities = Activity::whereIn('project_id', $projectIds)
            ->with([
                'project:id,name',
                'user:id,name,avatar',
            ])
            ->latest()
            ->limit(6)
            ->get([
                'id',
                'project_id',
                'user_id',
                'title',
                'description',
                'created_at',
            ]);

        $projectFocus = Project::whereIn('id', $projectIds)
            ->withExists('favoritedByAuthUser AS favorite')
            ->withCount([
                'tasks as open_tasks_count' => function ($query) use ($user) {
                    $query
                        ->when(
                            $user->hasRole('client'),
                            fn ($query) => $query->where('hidden_from_clients', false)
                        )
                        ->where('assigned_to_user_id', $user->id)
                        ->whereNull('completed_at');
                },
            ])
            ->having('open_tasks_count', '>', 0)
            ->orderByDesc('favorite')
            ->orderByDesc('open_tasks_count')
            ->orderBy('name')
            ->limit(6)
            ->get(['id', 'name']);

        return Inertia::render('MyWork/Index', [
            'stats' => $stats,
            'upcomingTasks' => $upcomingTasks,
            'recentActivities' => $recentActivities,
            'projectFocus' => $projectFocus,
        ]);
    }
}
