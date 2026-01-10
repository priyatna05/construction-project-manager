<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $inventory_id
 * @property int $task_id
 * @property int|null $allocated_by_user_id
 * @property string $quantity_allocated
 * @property string $cost_at_allocation
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $allocatedByUser
 * @property-read \App\Models\Inventory $inventory
 * @property-read \App\Models\Task $task
 * @method static \Database\Factories\InventoryTaskAllocationFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereAllocatedByUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereAllocationDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereCostAtAllocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereInventoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereQuantityAllocated($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InventoryTaskAllocation whereUpdatedAt($value)
 * @mixin \Eloquent
 * @mixin IdeHelperInventoryTaskAllocation
 */
class InventoryTaskAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'task_id',
        'allocated_by_user_id',
        'quantity_allocated',
        'cost_at_allocation',
        'notes',
    ];
    protected $table = 'inventory_task_allocations';
    protected $cast = [
        'quantity_allocated' => 'decimal:4',
        'cost_at_allocation' => 'decimal:2',
    ];

    /**
     * Relations: to inventory
     */
    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    /**
     * Relations: to task
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Relations: to users can be allocated
     */
    public function allocatedByUser() : BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_by_user_id');
    }
}
