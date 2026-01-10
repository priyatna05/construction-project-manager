<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Project;
use App\Models\Label;
use App\Events\Task\TaskUpdated;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Carbon\Carbon;

class TaskService
{

    private function calculateLagDaysFromStartAndDependency(?string $taskStartDate, int $dependsOnTaskId): int
    {
        try {
            if (empty($taskStartDate)) {
                return 0;
            }

            $dependency = Task::find($dependsOnTaskId);
            if (!$dependency) {
                // Log::warning('calculateLagDaysFromStartAndDependency: dependency task not found', [
                //     'depends_on_task_id' => $dependsOnTaskId
                // ]);
                return 0;
            }

            if (empty($dependency->end_date)) {
                // Log::info('calculateLagDaysFromStartAndDependency: dependency has no end_date, defaulting to 0', [
                //     'depends_on_task_id' => $dependsOnTaskId
                // ]);
                return 0;
            }

            // Clean date strings to remove extra timezone info that causes parsing errors
            $cleanTaskStartDate = preg_replace('/\s*\([^)]*\)$/', '', $taskStartDate);
            $cleanDependencyEndDate = preg_replace('/\s*\([^)]*\)$/', '', $dependency->end_date);

            $start = Carbon::parse($cleanTaskStartDate)->startOfDay();
            $end = Carbon::parse($cleanDependencyEndDate)->startOfDay();

            $diff = $start->diffInDays($end, false);
            return max(0, (int) $diff);
        } catch (\Throwable $e) {
            // Log::error('Error calculating lag days', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    public function createTask(Project $project, array $data): Task
    {
        return DB::transaction(function () use ($project, $data) {
            // Log::info('Creating task with data:', $data);

            $task = new Task();
            $task->project_id = $project->id;
            $task->created_by_user_id = Auth::id();
            $task->group_id = $data['group_id'];
            $task->number = ($project->tasks()->withArchived()->max('number') ?? 0) + 1;
            $task->name = $data['name'];
            $task->description = $data['description'] ?? null;
            $task->assigned_to_user_id = $data['assigned_to_user_id'] ?? null;
            $task->start_date = !empty($data['start_date']) ? $data['start_date'] : null;
            $task->end_date = !empty($data['end_date']) ? $data['end_date'] : null;

            // Handle monetary values
            $task->budget_task_plan = isset($data['budget_task_plan']) ? $data['budget_task_plan'] : 0;
            $task->weight_task = isset($data['weight_task']) ? $data['weight_task'] : 0;
            $task->unit_cost_task = isset($data['unit_cost_task']) ? $data['unit_cost_task'] : 0;

            $task->volume = $data['volume'] ?? null;
            $task->save();

            // Log::info('Task created with ID:', ['id' => $task->id]);

            // Attach labels
            if (!empty($data['labels']) && is_array($data['labels'])) {
                $task->labels()->attach($data['labels']);
            }

            // Attach unit label
            if (!empty($data['unit'])) {
                $unitLabel = Label::where('slug', $data['unit'])
                    ->where('type', Label::TYPE_TASK_INVENTORY_UNIT)
                    ->first();
                if ($unitLabel) {
                    $task->labels()->attach($unitLabel->id);
                }
            }

            // Attach type label
            if (!empty($data['type'])) {
                $typeLabel = Label::where('slug', $data['type'])
                    ->where('type', Label::TYPE_TASK)
                    ->first();
                if ($typeLabel) {
                    $task->labels()->attach($typeLabel->id);
                }
            }

            // Attach priority label
            if (!empty($data['priority'])) {
                $priorityLabel = Label::where('slug', $data['priority'])
                    ->where('type', Label::TYPE_PRIORITY)
                    ->first();
                if ($priorityLabel) {
                    $task->labels()->attach($priorityLabel->id);
                }
            }

            // Attach subscribed users
            if (!empty($data['subscribed_users']) && is_array($data['subscribed_users'])) {
                $task->subscribedUsers()->attach($data['subscribed_users']);
            }

            // 🔥 Handle dependencies (with auto lag days)
            if (!empty($data['depends_on_task_id'])) {
                $providedLag = array_key_exists('lag_days', $data) ? $data['lag_days'] : null;

                $lagToUse = (is_null($providedLag) || $providedLag === '')
                    ? $this->calculateLagDaysFromStartAndDependency($task->start_date, (int)$data['depends_on_task_id'])
                    : (int) $providedLag;

                $task->dependencies()->syncWithoutDetaching([
                    $data['depends_on_task_id'] => [
                        'relation_type_id' => $data['relation_type_id'] ?? 1,
                        'lag_days' => max(0, $lagToUse),
                    ],
                ]);

                // Log::info('Dependency attached:', [
                //     'depends_on' => $data['depends_on_task_id'],
                //     'relation' => $data['relation_type_id'] ?? 1,
                //     'lag_days' => $lagToUse
                // ]);
            }

            // Handle inventories
            if (!empty($data['inventories']) && is_array($data['inventories'])) {
                $this->syncInventories($task, $data['inventories']);
            }

            return $task->fresh($task->defaultWith)->load('dependentTasks');
        });
    }


    private function syncInventories(Task $task, array $inventoriesData): void
    {
        $startTime = microtime(true);
        // Log::info("Starting inventory sync for Task ID: {$task->id}", [
        //     'inventories_count' => count($inventoriesData),
        //     'start_time' => $startTime
        // ]);

        // Early validation
        if (empty($inventoriesData)) {
            // Log::info("No inventories to sync for Task ID: {$task->id}");
            return;
        }

        // Validasi format data
        foreach ($inventoriesData as $item) {
            if (!isset($item['inventory_id']) || !isset($item['quantity'])) {
                // Log::error("Invalid inventory data format", ['item' => $item]);
                throw new \InvalidArgumentException("Inventory data must contain 'inventory_id' and 'quantity'");
            }
        }

        // Get current allocations in a single query
        $currentAllocations = $task->allocatedInventories()->pluck('quantity_allocated', 'inventory_id')->toArray();

        // Collect all inventory IDs to fetch in one query
        $inventoriesToFetch = array_unique(array_merge(
            array_column($inventoriesData, 'inventory_id'),
            array_keys($currentAllocations)
        ));

        // Batch fetch all inventories at once
        $inventories = \App\Models\Inventory::whereIn('id', $inventoriesToFetch)->get()->keyBy('id');

        $syncData = [];
        $stockAdjustments = [
            'decrement' => [],
            'increment' => []
        ];

        // Pre-calculate all changes in memory
        foreach ($inventoriesData as $item) {
            $inventoryId = $item['inventory_id'];
            $inventory = $inventories->get($inventoryId);
            if (!$inventory) {
                // Log::warning("Inventory ID: {$inventoryId} not found");
                continue;
            }

            $newQuantity = $item['quantity'];
            $oldQuantity = $currentAllocations[$inventoryId] ?? 0;

            // Check stock availability considering current allocation
            $availableStock = $inventory->quantity_on_hand + $oldQuantity;
            if ($availableStock < $newQuantity) {
                throw new \Exception("Not enough stock for inventory: {$inventory->name}. Available: {$availableStock}, Requested: {$newQuantity}");
            }

            $costAtAllocation = $newQuantity * $inventory->unit_cost;
            $syncData[$inventoryId] = [
                'quantity_allocated' => $newQuantity,
                'cost_at_allocation' => $costAtAllocation,
                'notes' => $item['note'] ?? '',
                'allocated_by_user_id' => Auth::id(),
            ];
        }

        // Perform sync and get changes
        $changes = $task->allocatedInventories()->sync($syncData);

        // Prepare stock adjustments for batch processing
        foreach ($changes['attached'] as $inventoryId) {
            $quantity = $syncData[$inventoryId]['quantity_allocated'];
            $stockAdjustments['decrement'][$inventoryId] = ($stockAdjustments['decrement'][$inventoryId] ?? 0) + $quantity;
        }

        foreach ($changes['updated'] as $inventoryId) {
            $newQuantity = $syncData[$inventoryId]['quantity_allocated'];
            $oldQuantity = $currentAllocations[$inventoryId];
            $diff = $newQuantity - $oldQuantity;
            if ($diff > 0) {
                $stockAdjustments['decrement'][$inventoryId] = ($stockAdjustments['decrement'][$inventoryId] ?? 0) + $diff;
            } elseif ($diff < 0) {
                $stockAdjustments['increment'][$inventoryId] = ($stockAdjustments['increment'][$inventoryId] ?? 0) + (-$diff);
            }
        }

        foreach ($changes['detached'] as $inventoryId) {
            $quantity = $currentAllocations[$inventoryId];
            $stockAdjustments['increment'][$inventoryId] = ($stockAdjustments['increment'][$inventoryId] ?? 0) + $quantity;
        }

        // Batch process stock adjustments
        foreach ($stockAdjustments['decrement'] as $inventoryId => $quantity) {
            $inventory = $inventories->get($inventoryId);
            $inventory->decrement('quantity_on_hand', $quantity);
            // Log::info("Stock reduced for allocation Inventory ID: {$inventoryId}", [
            //     'quantity_reduced' => $quantity,
            //     'remaining_stock' => $inventory->quantity_on_hand
            // ]);
        }

        foreach ($stockAdjustments['increment'] as $inventoryId => $quantity) {
            $inventory = $inventories->get($inventoryId);
            $inventory->increment('quantity_on_hand', $quantity);
            // Log::info("Stock increased for allocation Inventory ID: {$inventoryId}", [
            //     'quantity_increased' => $quantity,
            //     'remaining_stock' => $inventory->quantity_on_hand
            // ]);
        }

        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2); // in milliseconds

        // Log::info("Inventory sync completed for Task ID: {$task->id}", [
        //     'duration_ms' => $duration,
        //     'attached_count' => count($changes['attached']),
        //     'updated_count' => count($changes['updated']),
        //     'detached_count' => count($changes['detached']),
        //     'total_inventories_processed' => count($inventoriesData)
        // ]);
    }

    public function updateTask(Task $task, array $validatedData): Task
    {
        return DB::transaction(function () use ($task, $validatedData) {
            $relationKeys = [
                'labels',
                'subscribed_users',
                'attachments',
                'dependencies',
                'inventories',
                'relation'
            ];

            $taskColumnData = Arr::except($validatedData, $relationKeys);

            if (isset($taskColumnData['budget_task_plan'])) {
                $taskColumnData['budget_task_plan'];
            }
            if (isset($taskColumnData['unit_cost_task'])) {
                $taskColumnData['unit_cost_task'];
            }

            if (!empty($taskColumnData)) {
                $task->fill($taskColumnData)->save();
            }

            $assignedToChanged = $task->wasChanged('assigned_to_user_id');

            // Handle labels
            if (Arr::hasAny($validatedData, ['labels', 'unit', 'type', 'priority'])) {
                $labelIdsToSync = $validatedData['labels'] ?? [];

                $existingSpecificLabels = Label::join('labelables', 'labels.id', '=', 'labelables.label_id')
                    ->where('labelables.labelable_id', $task->id)
                    ->where('labelables.labelable_type', Task::class)
                    ->whereIn('labels.type', [Label::TYPE_TASK_INVENTORY_UNIT, Label::TYPE_TASK, Label::TYPE_PRIORITY])
                    ->whereNull('labels.archived_at')
                    ->whereNull('labels.deleted_at')
                    ->pluck('labels.id');

                $labelIdsToSync = array_merge($labelIdsToSync, $existingSpecificLabels->all());

                $labelSlugsAndTypes = [
                    'unit' => Label::TYPE_TASK_INVENTORY_UNIT,
                    'type' => Label::TYPE_TASK,
                    'priority' => Label::TYPE_PRIORITY,
                ];

                foreach ($labelSlugsAndTypes as $key => $type) {
                    if (array_key_exists($key, $validatedData)) {
                        $labelsToDetach = Label::join('labelables', 'labels.id', '=', 'labelables.label_id')
                            ->where('labelables.labelable_id', $task->id)
                            ->where('labelables.labelable_type', Task::class)
                            ->where('labels.type', $type)
                            ->pluck('labels.id');
                        $task->labels()->detach($labelsToDetach);

                        if (!empty($validatedData[$key])) {
                            $label = Label::where('slug', $validatedData[$key])->where('type', $type)->first();
                            if ($label) {
                                $labelIdsToSync[] = $label->id;
                            }
                        }
                    }
                }

                $task->labels()->sync(array_unique($labelIdsToSync));
            }

            // Handle subscribed users
            if (isset($validatedData['subscribed_users']) && is_array($validatedData['subscribed_users'])) {
                $task->subscribedUsers()->sync($validatedData['subscribed_users']);
            }

            // 🔥 Handle dependencies (auto lag days)
            if (array_key_exists('dependencies', $validatedData)) {
                $dependencies = $validatedData['dependencies'];
                $syncData = [];

                if (is_array($dependencies) && !empty($dependencies)) {
                    foreach ($dependencies as $dep) {
                        if (isset($dep['id']) && isset($dep['relation_type_id'])) {
                            $providedLag = array_key_exists('lag_days', $dep) ? $dep['lag_days'] : null;

                            $lagToUse = (is_null($providedLag) || $providedLag === '')
                                ? $this->calculateLagDaysFromStartAndDependency($task->start_date, (int)$dep['id'])
                                : (int) $providedLag;

                            $syncData[$dep['id']] = [
                                'relation_type_id' => $dep['relation_type_id'],
                                'lag_days' => max(0, $lagToUse),
                            ];
                        }
                    }
                }

                $task->dependencies()->sync($syncData);
            }

            if (array_key_exists('relation', $validatedData)) {
                $relationId = $validatedData['relation'];
                if ($relationId) {
                    $task->dependencies()->update(['relation_type_id' => $relationId]);
                }
            }

            // Handle inventories
            if (array_key_exists('inventories', $validatedData)) {
                $this->syncInventories($task, $validatedData['inventories'] ?? []);
                $formattedInventories = $task->inventoryAllocations->map(function ($allocation) {
                    return [
                        'inventory_id' => $allocation->inventory_id,
                        'task_id' => $allocation->task_id,
                        'quantity_allocated' => $allocation->quantity_allocated,
                        'cost_at_allocation' => $allocation->cost_at_allocation,
                        'notes' => $allocation->notes,
                        'inventory' => $allocation->inventory->toArray(),
                    ];
                })->toArray();
                \App\Events\Task\InventoryUpdated::dispatch($task->id, $formattedInventories);
            }

            if ($assignedToChanged) {
                TaskUpdated::dispatch($task, 'assigned_to_user_id');
                TaskUpdated::dispatch($task, 'assigned_to_user');
            }

            return $task->fresh([
                'project:id,name',
                'taskGroup:id,name',
                'createdByUser:id,name,avatar',
                'assignedToUser:id,name,avatar',
                'subscribedUsers:id',
                'labels:id,name,color,type,slug',
                'attachments',
                'dependencies',
                'dependentTasks',
                'allocatedInventories'
            ]);
        });
    }


    /**
     * Calculate the actual budget for a task based on its work reports.
     *
     * @param Task $task
     * @return float
     */
    public static function calculateBudgetTaskActual(Task $task): float
    {
        return (float) $task->workReports()
            ->whereHas('labels', fn($q) => $q->where('slug', 'approved_work_report'))
            ->sum('actual_cost');
    }


    public function moveTask(array $data): Task
    {
        return DB::transaction(function () use ($data) {
            $task = Task::findOrFail($data['task_id']);
            $task->group_id = $data['target_group_id'];
            $task->number = $data['new_order'] ?? $task->number;
            $task->save();

            return $task;
        });
    }

    public function completeTask(Task $task, bool $completed, ?string $completedAt = null): Task
    {
        return DB::transaction(function () use ($task, $completed, $completedAt) {
            if ($completed) {
                try {
                    $task->completed_at = $completedAt ? Carbon::parse($completedAt) : now();
                } catch (\Throwable $e) {
                    $task->completed_at = now();
                }
            } else {
                $task->completed_at = null;
            }

            $task->save();

            return $task;
        });
    }

    public function archiveTask(array $data): Task
    {
        $task = $data['task'];
        return DB::transaction(function () use ($task) {
            $task->archived_at = now();
            $task->save();

            return $task;
        });
    }

    public function restoreTask(Task $task): Task
    {
        return DB::transaction(function () use ($task) {
            $task->archived_at = null;
            $task->save();

            return $task;
        });
    }

    public function deleteTask(Task $task): void
    {
        $task->forceDelete();
    }

    public function reorderTasks(Project $project, array $ids, int $group_id, int $from_index, int $to_index): void
    {
        DB::transaction(function () use ($ids, $group_id) {
            foreach ($ids as $index => $taskId) {
                Task::where('id', $taskId)->update(['group_id' => $group_id, 'order_column' => $index + 1]);
            }
        });
    }

    public function moveTaskGroup(array $ids, int $from_group_id, int $to_group_id, int $from_index, int $to_index): void
    {
        DB::transaction(function () use ($ids, $to_group_id, $to_index) {
            foreach ($ids as $index => $taskId) {
                Task::where('id', $taskId)->update(['group_id' => $to_group_id, 'order_column' => $to_index + $index + 1]);
            }
        });
    }
}
