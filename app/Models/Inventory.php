<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\InventoryType;
use App\Enums\InventoryStatus;
use App\Enums\InventoryUnit;
use Lacodix\LaravelModelFilter\Traits\HasFilters;
use LaravelArchivable\Archivable;

/**
 * @property int                     $id
 * @property string                  $code_inventory
 * @property string                  $name_inventory
 * @property string|null             $description_inventory
 * @property InventoryStatus         $status
 * @property InventoryType           $type
 * @property InventoryUnit|null      $unit
 * @property float                   $unit_cost
 * @property float|null              $quantity_inventory
 * @property int|null                $location_inventory
 * @property \App\Models\Project  $location
 * @property float                   $total_value
 * @property \Illuminate\Support\Collection|InventoryAllocation[] $allocations
 * @property \Illuminate\Support\Collection|User[]               $users
 */
class Inventory extends Model
{
    use HasFactory, SoftDeletes, Archivable, HasFilters;

    protected $fillable = [
        'code_inventory',
        'name_inventory',
        'description_inventory',
        'status',
        'type',
        'unit',
        'unit_cost',
        'quantity_inventory',
        'location_inventory',
    ];

    // Auto-cast attributes
    protected $casts = [
        'type'               => InventoryType::class,
        'status'             => InventoryStatus::class,
        'unit'               => InventoryUnit::class,
        'unit_cost'          => 'decimal:2',
        'quantity_inventory' => 'decimal:2',
        'deleted_at'         => 'datetime',
    ];

    // Append computed attributes
    protected $appends = ['total_value'];

    // Default eager loading
    protected $with = ['location', 'allocations'];

    // ModelFilter class for query filtering
    protected $filter = \App\Models\Filters\InventoryFilter::class;

    /**
     * Relationship: Project location
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'location_inventory');
    }

    /**
     * Relationship: Inventory allocations
     */
    public function allocations(): HasMany
    {
        return $this->hasMany(InventoryAllocation::class);
    }

    /**
     * Relationship: Users via pivot
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'inventory_user',
            'inventory_id',
            'user_id'
        )
        ->withTimestamps();
    }

    /**
     * Scope: only active inventories
     */
    public function scopeActive($query)
    {
        return $query->where('status', InventoryStatus::ACTIVE);
    }

    /**
     * Scope: inventories in stock
     */
    public function scopeInStock($query)
    {
        return $query->where('quantity_inventory', '>', 0);
    }

    /**
     * Scope: filter by type
     */
    public function scopeOfType($query, InventoryType|string $type)
    {
        $value = $type instanceof InventoryType ? $type->value : $type;
        return $query->where('type', $value);
    }

    /**
     * Accessor: total value of inventory
     */
    public function getTotalValueAttribute(): float
    {
        return (float) $this->unit_cost * (float) $this->quantity_inventory;
    }

    /**
     * Mutator: uppercase code
     */
    public function setCodeInventoryAttribute($value)
    {
        $this->attributes['code_inventory'] = strtoupper($value);
    }

    /**
     * Add: more in here!
     */
}
