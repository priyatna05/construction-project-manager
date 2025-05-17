<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\InventoryStatus;
use App\Enums\InventoryType;
use App\Enums\InventoryUnit;

class Inventory extends Model
{
    protected $fillable = [
        'name_inventory',
        'code_inventory',
        'code_inventory',
        'type',
        'description_inventory',
        'unit',
        'unit_cost',
        'sum_cost',
        'status',
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'sum_cost' => 'decimal:2',
        'type' => InventoryType::class,
        'unit' => InventoryUnit::class,
        'status' => InventoryStatus::class,
    ];

    // Scopes for filtering
    public function scopeOfType($query, InventoryType $type)
    {
        return $query->where('type', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('status', InventoryStatus::ACTIVE);
    }

    public function scopeInactive($query)
    {
        return $query->where('status', InventoryStatus::INACTIVE);
    }

    public function scopeSearchByQueryString($query)
    {
        if (request()->has('search')) {
            $search = request()->get('search');
            return $query->where(function($q) use ($search) {
                $q->where('name_inventory', 'like', "%{$search}%")
                  ->orWhere('code_inventory', 'like', "%{$search}%")
                  ->orWhere('description_inventory', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    public function scopeFilterByQueryString($query)
    {
        return $query->when(request()->has('type'), function($q) {
            $q->where('type', request()->get('type'));
        })->when(request()->has('status'), function($q) {
            $q->where('status', request()->get('status'));
        });
    }

    public function inventoriesAllocations()
    {
        return $this->hasMany(InventoryAllocation::class);
    }

    public function clientCompany()
    {
        return $this->belongsTo(ClientCompany::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'inventory_user', 'inventory_id', 'user_id');
    }
}
