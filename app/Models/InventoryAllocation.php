<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'project_id',
        'task_id',
        'quantity',
        'allocated_date',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'allocated_date' => 'date',
    ];

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
