<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class SearchController extends Controller
{
    /**
     * Handle search queries across multiple models and static pages/features.
     */
    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json(['results' => []]);
        }

        $results = [];

        // Static pages to include in search
        $pages = [
            ['title' => 'Dashboard', 'url' => route('dashboard')],
            ['title' => 'Projects', 'url' => route('projects.index')],
            ['title' => 'Tasks', 'url' => route('projects.tasks', ['project' => 1])], // example project id 1
            ['title' => 'Users', 'url' => route('users.index')],
            ['title' => 'Settings', 'url' => route('settings.company.edit')],
            // Add more pages as needed
        ];

        foreach ($pages as $page) {
            if (stripos($page['title'], $query) !== false) {
                $results[] = [
                    'type' => 'Page',
                    'title' => $page['title'],
                    'url' => $page['url'],
                ];
            }
        }

        // Static features to include in search
        $features = [
            ['title' => 'Task Management', 'url' => route('projects.index')],
            ['title' => 'User Management', 'url' => route('users.index')],
            ['title' => 'Inventory Control', 'url' => route('inventories.index')],
            ['title' => 'Reporting', 'url' => route('reports.logged-time.sum')],
            // Add more features as needed
        ];

        foreach ($features as $feature) {
            if (stripos($feature['title'], $query) !== false) {
                $results[] = [
                    'type' => 'Feature',
                    'title' => $feature['title'],
                    'url' => $feature['url'],
                ];
            }
        }

        // Search Projects by name
        $projects = Project::where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name']);

        foreach ($projects as $project) {
            $results[] = [
                'type' => 'Project',
                'id' => $project->id,
                'title' => $project->name,
                'url' => route('projects.edit', $project->id),
            ];
        }

        // Search Tasks by title
        $tasks = Task::where('title', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'title', 'project_id']);

        foreach ($tasks as $task) {
            $results[] = [
                'type' => 'Task',
                'id' => $task->id,
                'title' => $task->title,
                'url' => route('tasks.open', ['project' => $task->project_id, 'task' => $task->id]),
            ];
        }

        // Search Users by name or email
        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name']);

        foreach ($users as $user) {
            $results[] = [
                'type' => 'User',
                'id' => $user->id,
                'title' => $user->name,
                'url' => route('users.edit', $user->id),
            ];
        }

        return response()->json(['results' => $results]);
    }
}
