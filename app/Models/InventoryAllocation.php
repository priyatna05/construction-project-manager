<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int                     \$id
 * @property int                     \$inventory_id
 * @property int|null                \$project_id
 * @property int|null                \$task_id
 * @property float                   \$quantity_allocation
 * @property \Illuminate\Support\Carbon  \$allocated_date
 * @property Inventory               \$inventory
 */
class InventoryAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'project_id',
        'task_id',
        'quantity_allocation',
        'allocated_date',
    ];

    protected $casts = [
        'quantity_allocation' => 'decimal:2',
        'allocated_date'      => 'date',
    ];

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

     /**
     * Add: more in here!
     */
}
