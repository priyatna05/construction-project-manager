<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskGroup;
use App\Models\User;
use App\Models\Inventory;
use App\Models\WorkReport;

class SearchController extends Controller
{
    /**
     * Helper untuk generate URL yang aman.
     */
    protected function safeRoute(string $name, array $params = [])
    {
        try {
            return route($name, $params);
        } catch (\Throwable $e) {
            logger()->error('Search route generation failed', [
                'route'  => $name,
                'params' => $params,
                'error'  => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function search(Request $request)
    {
        $query = trim($request->input('query', ''));
        $results = [];

        // ==========================
        // 3. Projects
        // ==========================
        $projects = Project::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('code', 'like', "%{$query}%");
        })
            ->limit(5)
            ->get(['id', 'name', 'code']);

        foreach ($projects as $project) {
            $url = $this->safeRoute('projects.index', [
                'search'    => $project->name,
                'view'      => 'table', // or 'card' default UI
                'highlight' => $project->id,
            ]);

            if ($url) {
                $results[] = [
                    'type'  => 'Project',
                    'id'    => $project->id,
                    'title' => $project->name . ($project->code ? " ({$project->code})" : ''),
                    'url'   => $url,
                ];
            }
        }

        // ==========================
        // 4. Task Groups  (🔧 ini yang tadinya error)
        // ==========================
        $taskGroups = TaskGroup::where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'project_id']);

        foreach ($taskGroups as $taskGroup) {
            $url = $this->safeRoute('projects.tasks', [
                'project'         => $taskGroup->project_id,
                'groups'          => [$taskGroup->id],
            ]);

            if ($url) {
                $results[] = [
                    'type'  => 'Task Group',
                    'id'    => $taskGroup->id,
                    'title' => $taskGroup->name,
                    'url'   => $url,
                ];
            }
        }


        // ==========================
        // 5. Tasks
        // ==========================
        $tasks = Task::where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'project_id']);

        foreach ($tasks as $task) {
            $url = $this->safeRoute('projects.tasks.open', [
                'project' => $task->project_id,
                'task'    => $task->id,
            ]);

            if ($url) {
                $results[] = [
                    'type'  => 'Task',
                    'id'    => $task->id,
                    'title' => $task->name,
                    'url'   => $url,
                ];
            }
        }

        // ==========================
        // 6. Inventories
        // ==========================
        $inventories = Inventory::where('name', 'like', "%{$query}%")
            ->orWhere('code', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'code']);

        foreach ($inventories as $inventory) {
            $url = $this->safeRoute('inventories.index', [
                'search' => $query,
                'highlight' => $inventory->id,
            ]);

            if ($url) {
                $results[] = [
                    'type'  => 'Inventory',
                    'id'    => $inventory->id,
                    'title' => $inventory->name . ($inventory->code ? " ({$inventory->code})" : ''),
                    'url'   => $url,
                ];
            }
        }

        // ==========================
        // 7. Work Reports
        // ==========================
        $workReports = WorkReport::with('task:id,project_id')
            ->where('name', 'like', "%{$query}%")
            ->orWhere('work_done', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'task_id']);

        foreach ($workReports as $wr) {
            if (!$wr->task || !$wr->task->project_id) {
                continue;
            }

            $url = $this->safeRoute('projects.tasks.open', [
                'project'        => $wr->task->project_id,
                'task'           => $wr->task_id,
                'tab'            => 'work_reports',
                'work_report_id' => $wr->id,
            ]);

            if ($url) {
                $results[] = [
                    'type'  => 'WorkReport',
                    'id'    => $wr->id,
                    'title' => $wr->name ?: "Work Report #{$wr->id}",
                    'url'   => $url,
                ];
            }
        }

        // ==========================
        // 8. Users
        // ==========================
        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhereHas('roles', fn($q) => $q->where('name', 'like', "%{$query}%"))
            ->limit(5)
            ->get(['id', 'name']);

        foreach ($users as $user) {
            $url = $this->safeRoute('users.index', ['search' => $query]) . "#user-{$user->id}";

            if ($url) {
                $results[] = [
                    'type'  => 'User',
                    'id'    => $user->id,
                    'title' => $user->name,
                    'url'   => $url,
                ];
            }
        }


        return response()->json(['results' => $results]);
    }
}
