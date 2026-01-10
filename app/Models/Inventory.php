<?php

namespace App\Models;

use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Lacodix\LaravelModelFilter\Traits\HasFilters;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use LaravelArchivable\Archivable;
use Illuminate\Database\Eloquent\Builder;

/**
 * @property int                     $id
 * @property string                  $code
 * @property string                  $name
 * @property string|null             $description
 * @property float                   $unit_cost
 * @property float|null              $quantity_on_hand

 * @property float                   $total_value
 * @property \Illuminate\Support\Collection|User[] $users
 * @property \Illuminate\Support\Collection|Label[] $labels
 * @property \App\Models\Label|null  $status_label
 * @property \App\Models\Label|null  $type_label
 * @property \App\Models\Label|null  $unit_label
 * @property string $status
 * @property string $type
 * @property string|null $unit
 * @property int|null $created_by_user_id
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InventoryTaskAllocation> $allocations
 * @property-read int|null $allocations_count
 * @property-write mixed $code_inventory
 * @property-read \App\Models\Task|null $task
 * @method static Builder<static>|Inventory active()
 * @method static \Database\Factories\InventoryFactory factory($count = null, $state = [])
 * @method static Builder<static>|Inventory filter(array $values, string $group = '__default')
 * @method static Builder<static>|Inventory filterByQueryString(string $group = '__default')
 * @method static Builder<static>|Inventory newModelQuery()
 * @method static Builder<static>|Inventory newQuery()
 * @method static Builder<static>|Inventory ofType(string $typeSlug)
 * @method static Builder<static>|Inventory onlyTrashed()
 * @method static Builder<static>|Inventory query()
 * @method static Builder<static>|Inventory search(?string $search, ?array $searchable = null)
 * @method static Builder<static>|Inventory searchByQueryString()
 * @method static Builder<static>|Inventory sort(?array $sort = null)
 * @method static Builder<static>|Inventory sortByQueryString()
 * @method static Builder<static>|Inventory whereArchivedAt($value)
 * @method static Builder<static>|Inventory whereCode($value)
 * @method static Builder<static>|Inventory whereCreatedAt($value)
 * @method static Builder<static>|Inventory whereCreatedByUserId($value)
 * @method static Builder<static>|Inventory whereDeletedAt($value)
 * @method static Builder<static>|Inventory whereDescription($value)
 * @method static Builder<static>|Inventory whereId($value)
 * @method static Builder<static>|Inventory whereName($value)

 * @method static Builder<static>|Inventory whereQuantityOnHand($value)
 * @method static Builder<static>|Inventory whereStatus($value)
 * @method static Builder<static>|Inventory whereType($value)
 * @method static Builder<static>|Inventory whereUnit($value)
 * @method static Builder<static>|Inventory whereUnitCost($value)
 * @method static Builder<static>|Inventory whereUpdatedAt($value)
 * @method static Builder<static>|Inventory withTrashed()
 * @method static Builder<static>|Inventory withoutTrashed()
 * @mixin \Eloquent
 * @mixin IdeHelperInventory
 */
class Inventory extends Model
{
    use HasFactory, SoftDeletes, Archivable, HasFilters, IsSearchable, IsSortable;

    protected $fillable = [
        'code',
        'name',
        'description',
        'unit_cost',
        'quantity_on_hand',
        'created_by_user_id',
    ];

    protected $attributes = [
        'code' => '',
    ];

    // Auto-cast attributes
    protected $casts = [
        'unit_cost' => 'decimal:2',
        'quantity_on_hand' => 'decimal:2',
        'archived_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Append computed attributes, Default eager loading, search, observable
     */
    protected $searchable = ['code', 'name'];
    protected $sortable = [
        // Show newest inventories first by default
        'created_at' => 'desc',
        // Keep name sortable (and as a tiebreaker)
        'name' => 'asc',
    ];
    protected $observables = ['archived', 'unArchived', 'deleted'];
    protected $with = ['allocations'];


    // === Relationships ===

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'inventory_task_allocations', 'inventory_id', 'task_id')
            ->withPivot([
                'quantity_allocated',
                'cost_at_allocation',
                'notes',
                'allocated_by_user_id'
            ])
            ->withTimestamps();
    }

    public function labels(): MorphToMany
    {
        return $this->morphToMany(Label::class, 'labelable');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function allocations()
    {
        return $this->hasMany(InventoryTaskAllocation::class);
    }

    // === Scopes ===

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereHas(
            'labels',
            fn($q) =>
            $q->where('slug', 'active')->where('labels.type', 'inventory_status_label')
        );
    }

    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->whereHas(
            'labels',
            fn($q) =>
            $q->where('slug', 'archived')->where('labels.type', 'inventory_status_label')
        );
    }

    public function scopeOfType(Builder $query, string $typeSlug): Builder
    {
        return $query->whereHas(
            'labels',
            fn($q) =>
            $q->where('slug', $typeSlug)->where('type', 'inventory_type_label')
        );
    }

    public function scopeStatus(Builder $query, string $slug): Builder
    {
        return $query->whereHas('labels', function ($q) use ($slug) {
            $q->where('slug', $slug)->where('type', 'inventory_status_label');
        });
    }

    // === Accessors ===

    public function getTotalValueAttribute(): float
    {
        return (float) $this->unit_cost * (float) $this->quantity_on_hand;
    }

    public function getStatusLabelAttribute(): ?Label
    {
        static $statusCache = [];

        $getLabel = function (string $slug) use (&$statusCache) {
            if (!isset($statusCache[$slug])) {
                $statusCache[$slug] = Label::where('slug', $slug)
                    ->where('type', 'inventory_status_label')
                    ->first();
            }
            return $statusCache[$slug];
        };

        // Jika inventory diarsipkan
        if ($this->archived_at) {
            return $getLabel('archived');
        }

        $quantity = $this->quantity_on_hand ?? 0;
        $allocated = $this->allocations()->sum('quantity_allocated') ?? 0;
        $available = $quantity - $allocated;

        // Stok habis (baik karena digunakan penuh atau belum diisi ulang)
        if ($quantity == 0) {
            return $getLabel('out_stock');
        }

        // Ada stok, tapi sebagian sudah dialokasikan
        if ($available > 0 && $allocated > 0) {
            return $getLabel('available');
        }

        // Ada stok penuh dan belum dialokasikan ke proyek/task
        if ($available == $quantity && $quantity > 0) {
            return $getLabel('active');
        }

        // Default fallback
        return $getLabel('inactive');
    }

    public function getTypeLabelAttribute(): ?Label
    {
        return $this->labels->where('type', Label::TYPE_INVENTORY_TYPE)->first();
    }

    public function getUnitLabelAttribute(): ?Label
    {
        return $this->labels->where('type', Label::TYPE_TASK_INVENTORY_UNIT)->first();
    }

    // === Mutators ===

    public function setCodeInventoryAttribute(string $value): void
    {
        $this->attributes['code'] = strtoupper($value);
    }

    public function setTypeLabel(string $id): void
    {
        try {
            $label = Label::where('type', 'inventory_type_label')
                ->where(function ($q) use ($id) {
                    $q->where('id', $id)->orWhere('slug', $id);
                })->first();
            if (!$label) {
                throw ValidationException::withMessages(['type' => "Label type with id or slug '{$id}' unknown."]);
            }
            $this->labels()->wherePivot('type', 'inventory_type_label')->detach();
            $this->labels()->attach($label->id, ['type' => 'inventory_type_label']);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function setStatusLabel(string $idOrSlug): void
    {
        try {
            $label = Label::where('type', 'inventory_status_label')
                ->where(function ($query) use ($idOrSlug) {
                    $query->where('id', $idOrSlug)
                        ->orWhere('slug', $idOrSlug);
                })
                ->first();

            if (!$label) {
                throw ValidationException::withMessages(['status' => "Label status with id or slug '{$idOrSlug}' unknown."]);
            }

            $this->labels()->wherePivot('type', 'inventory_status_label')->detach();
            $this->labels()->attach($label->id, ['type' => 'inventory_status_label']);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function setUnitLabel(string $id): void
    {
        try {
            $label = Label::where('type', 'task_inventory_unit_label')
                ->where(function ($q) use ($id) {
                    $q->where('id', $id)->orWhere('slug', $id);
                })->first();
            if (!$label) {
                throw ValidationException::withMessages(['unit' => "Label unit with id or slug '{$id}' unknown."]);
            }
            $this->labels()->wherePivot('type', 'task_inventory_unit_label')->detach();
            $this->labels()->attach($label->id, ['type' => 'task_inventory_unit_label']);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    // === Static ===

    public static function dropdownValues(): array
    {
        return self::orderBy('name')
            ->get(['id', 'name'])
            ->map(fn($item) => [
                'value' => (string) $item->id,
                'label' => $item->name,
            ])
            ->toArray();
    }

    public static function loadDefault(Builder $query = null): Builder
    {
        $query = $query ?: self::query();

        return $query->with([
            // 'projectSiteLocation',
        ]);
    }
}
