<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Collection;

class CriticalPathService
{
    /**
     * Calculate the critical path tasks for a given project.
     *
     * This method performs a critical path analysis (CPA) by:
     * 1. Building a graph of tasks and their dependencies.
     * 2. Calculating earliest start and finish times for each task.
     * 3. Calculating latest start and finish times without delaying the project.
     * 4. Determining slack for each task (latest start - earliest start).
     * 5. Identifying tasks with zero slack as critical path tasks.
     *
     * @param int $projectId The ID of the project to analyze.
     * @return Collection A collection of Task models that are on the critical path.
     */
    public function calculateCriticalPath(int $projectId): Collection
    {
        // Fetch all tasks for the project with dependencies and dates
        $tasks = Task::where('project_id', $projectId)
            ->with('dependencies')
            ->get()
            ->keyBy('id');

        // Initialize arrays to hold earliest and latest start/finish times
        $earliestStart = [];
        $earliestFinish = [];
        $latestStart = [];
        $latestFinish = [];

        // Helper function to calculate earliest start recursively
        $calculateEarliestStart = function ($taskId) use (&$tasks, &$earliestStart, &$earliestFinish, &$calculateEarliestStart) {
            if (isset($earliestStart[$taskId])) {
                return $earliestStart[$taskId];
            }
            $task = $tasks[$taskId];
            if ($task->dependencies->isEmpty()) {
                $earliestStart[$taskId] = $task->start_date ? $task->start_date->timestamp : 0;
            } else {
                $maxFinish = 0;
                foreach ($task->dependencies as $dep) {
                    $depFinish = $calculateEarliestStart($dep->id) + $this->getTaskDuration($dep);
                    if ($depFinish > $maxFinish) {
                        $maxFinish = $depFinish;
                    }
                }
                $earliestStart[$taskId] = $maxFinish;
            }
            $earliestFinish[$taskId] = $earliestStart[$taskId] + $this->getTaskDuration($task);
            return $earliestStart[$taskId];
        };

        // Calculate earliest start and finish for all tasks
        foreach ($tasks as $taskId => $task) {
            $calculateEarliestStart($taskId);
        }

        // Project finish time is max earliest finish
        $projectFinish = max($earliestFinish);

        // Helper function to calculate latest finish recursively
        $calculateLatestFinish = function ($taskId) use (&$tasks, &$latestStart, &$latestFinish, &$calculateLatestFinish, $projectFinish) {
            if (isset($latestFinish[$taskId])) {
                return $latestFinish[$taskId];
            }
            $task = $tasks[$taskId];
            $dependents = $tasks->filter(function ($t) use ($taskId) {
                return $t->dependencies->contains('id', $taskId);
            });
            if ($dependents->isEmpty()) {
                $latestFinish[$taskId] = $projectFinish;
            } else {
                $minStart = PHP_INT_MAX;
                foreach ($dependents as $dep) {
                    $depStart = $calculateLatestFinish($dep->id) - $this->getTaskDuration($dep);
                    if ($depStart < $minStart) {
                        $minStart = $depStart;
                    }
                }
                $latestFinish[$taskId] = $minStart;
            }
            $latestStart[$taskId] = $latestFinish[$taskId] - $this->getTaskDuration($task);
            return $latestFinish[$taskId];
        };

        // Calculate latest start and finish for all tasks
        foreach ($tasks as $taskId => $task) {
            $calculateLatestFinish($taskId);
        }

        // Determine slack and identify critical path tasks
        $criticalPathTasks = collect();
        foreach ($tasks as $taskId => $task) {
            $slack = $latestStart[$taskId] - $earliestStart[$taskId];
            if ($slack == 0) {
                $criticalPathTasks->push($task);
            }
        }

        return $criticalPathTasks;
    }

    /**
     * Calculate the duration of a task in seconds.
     * Uses start_date and end_date timestamps.
     * If dates are missing, assumes zero duration.
     *
     * @param Task $task
     * @return int Duration in seconds
     */
    protected function getTaskDuration(Task $task): int
    {
        if ($task->start_date && $task->end_date) {
            return $task->end_date->timestamp - $task->start_date->timestamp;
        }
        return 0;
    }
}
