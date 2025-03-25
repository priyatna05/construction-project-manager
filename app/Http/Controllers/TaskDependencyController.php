<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskDependencyController extends Controller
{
    public function index(Task $task): JsonResponse
    {
        return response()->json([
            'dependencies' => $task->dependencies()->get(),
            'dependentTasks' => $task->dependentTasks()->get(),
        ]);
    }

    public function store(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'depends_on_task_id' => 'required|exists:tasks,id',
            'relation_type' => 'required|in:Blocking,Sequential,Related',
        ]);

        (new TaskService)->addDependency($task, $request->depends_on_task_id, $request->relation_type);

        return response()->json(['message' => 'Task dependency added successfully']);
    }

    public function destroy(Task $task, $dependencyId): JsonResponse
    {
        (new TaskService)->removeDependency($task, $dependencyId);

        return response()->json(['message' => 'Task dependency removed successfully']);
    }
}
