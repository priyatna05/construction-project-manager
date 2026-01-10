<?php

use App\Models\Task;
use App\Models\WorkReport;
use App\Services\TaskService;

test('calculateBudgetTaskActual returns sum of actual_cost from work reports', function () {
    $task = Task::factory()->create();

    WorkReport::factory()->create([
        'task_id' => $task->id,
        'actual_cost' => 100.50,
    ]);

    WorkReport::factory()->create([
        'task_id' => $task->id,
        'actual_cost' => 200.75,
    ]);

    $actualCost = TaskService::calculateBudgetTaskActual($task);

    expect($actualCost)->toBe(301.25);
});

test('calculateBudgetTaskActual returns 0 when no work reports exist', function () {
    $task = Task::factory()->create();

    $actualCost = TaskService::calculateBudgetTaskActual($task);

    expect($actualCost)->toBe(0.0);
});

test('calculateBudgetTaskActual handles single work report', function () {
    $task = Task::factory()->create();

    WorkReport::factory()->create([
        'task_id' => $task->id,
        'actual_cost' => 150.00,
    ]);

    $actualCost = TaskService::calculateBudgetTaskActual($task);

    expect($actualCost)->toBe(150.00);
});
