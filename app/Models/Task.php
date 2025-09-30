<?php

namespace App\Models;

use App\Models\Filters\IsNullFilter;
use App\Models\Filters\WhereHasFilter;
use App\Models\Filters\WhereInFilter;
use App\Models\Filters\TaskCompletedFilter;
use App\Models\Filters\TaskOverdueFilter;
use App\Models\Timesheet;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Lacodix\LaravelModelFilter\Traits\HasFilters;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use LaravelArchivable\Archivable;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

/**
 * @property int $id
 * @property int $project_id
 * @property int $group_id
 * @property int|null $created_by_user_id
 * @property int|null $assigned_to_user_id
 * @property \Illuminate\Support\Carbon|null $assigned_at
 * @property int|null $number
 * @property int $order_column
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property numeric|null $budget_task
 * @property string|null $weight_task
 * @property string $progress_task
 * @property string $actual_cost
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @property string|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \App\Models\User|null $assignedToUser
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attachment> $attachments
 * @property-read int|null $attachments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \OwenIt\Auditing\Models\Audit> $audits
 * @property-read int|null $audits_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Comment> $comments
 * @property-read int|null $comments_count
 * @property-read \App\Models\User|null $createdByUser
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Task> $dependencies
 * @property-read int|null $dependencies_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InventoryTaskAllocation> $inventoryAllocations
 * @property-read int|null $inventory_allocations_count
 * @property-read \App\Models\Invoice|null $invoice
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Label> $labels
 * @property-read int|null $labels_count
 * @property-read \App\Models\Project $project
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $subscribedUsers
 * @property-read int|null $subscribed_users_count
 * @property-read \App\Models\TaskGroup $taskGroup
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Timesheet> $timesheets
 * @property-read int|null $timesheets_count
 * @method static Builder<static>|Task completed()
 * @method static \Database\Factories\TaskFactory factory($count = null, $state = [])
 * @method static Builder<static>|Task filter(array $values, string $group = '__default')
 * @method static Builder<static>|Task filterByQueryString(string $group = '__default')
 * @method static Builder<static>|Task newModelQuery()
 * @method static Builder<static>|Task newQuery()
 * @method static Builder<static>|Task ordered(string $direction = 'asc')
 * @method static Builder<static>|Task pending()
 * @method static Builder<static>|Task query()
 * @method static Builder<static>|Task search(?string $search, ?array $searchable = null)
 * @method static Builder<static>|Task searchByQueryString()
 * @method static Builder<static>|Task whereActualCost($value)
 * @method static Builder<static>|Task whereArchivedAt($value)
 * @method static Builder<static>|Task whereAssignedAt($value)
 * @method static Builder<static>|Task whereAssignedToUserId($value)
 * @method static Builder<static>|Task whereBudgetTask($value)
 * @method static Builder<static>|Task whereCreatedAt($value)
 * @method static Builder<static>|Task whereCreatedByUserId($value)
 * @method static Builder<static>|Task whereDeletedAt($value)
 * @method static Builder<static>|Task whereDescription($value)
 * @method static Builder<static>|Task whereEndDate($value)
 * @method static Builder<static>|Task whereGroupId($value)
 * @method static Builder<static>|Task whereId($value)
 * @method static Builder<static>|Task whereName($value)
 * @method static Builder<static>|Task whereNumber($value)
 * @method static Builder<static>|Task whereOrderColumn($value)
 * @method static Builder<static>|Task whereProgressTask($value)
 * @method static Builder<static>|Task whereProjectId($value)
 * @method static Builder<static>|Task whereStartDate($value)
 * @method static Builder<static>|Task whereUpdatedAt($value)
 * @method static Builder<static>|Task whereWeightTask($value)
 * @method static Builder<static>|Task withDefault()
 * @mixin \Eloquent
 * @mixin IdeHelperTask
 */
class Task extends Model implements AuditableContract, Sortable
{
    use Archivable, Auditable, HasFactory, HasFilters, IsSearchable, SortableTrait;

    protected $fillable = [
        'project_id',
        'group_id',
        'created_by_user_id',
        'assigned_to_user_id',
        'name',
        'number',
        'description',
        'start_date',
        'end_date',
        'budget_task',
        'weight_task',
        'progress_task',
        'actual_cost',
        'order_column',
        'assigned_at',
    ];

    protected $searchable = ['name', 'number'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget_task' => 'decimal:2',
        'assigned_at' => 'datetime',
        'order_column' => 'integer'
    ];

    protected $observables = ['archived', 'unArchived', 'deleted'];

    public array $defaultWith = [
        'project:id,name',
        'taskGroup:id,name',
        'createdByUser:id,name,avatar',
        'assignedToUser:id,name,avatar',
        'subscribedUsers:id',
        'labels:id,name,color,icon',
        'attachments',
        'allocatedInventories',
        'dependencies',
    ];
    /**
     * HANYA atribut ini yang akan diaudit.
     *
     * @var array
     */
    protected $auditInclude = [
        'group_id',
        'assigned_to_user_id',
        'name',
        'description',
        'start_date',
        'end_date',
        'budget_task',
        'weight_task',
        'progress_task',
        'actual_cost',
    ];
     /*
     * @var array
     */
    protected $dontKeepAuditOf = [
        'labels',
        'subscribedUsers',
        'attachments',
        'dependencies',
        'inventories',
        'allocatedInventories',
        'project',
        'taskGroup',
        'createdByUser',
        'assignedToUser',
        'timesheets',
        'comments',
        'activities',
    ];

    public function filters(): array
    {
        return [
            (new WhereInFilter('group_id'))->setQueryName('groups'),
            (new WhereInFilter('assigned_to_user_id'))->setQueryName('assignees'),
            (new TaskOverdueFilter('due_on'))->setQueryName('overdue'),
            (new IsNullFilter('due_on'))->setQueryName('not_set'),
            (new TaskCompletedFilter('completed_at'))->setQueryName('status'),
            (new WhereHasFilter('labels'))->setQueryName('labels'),
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('ordered', function ($query) {
            $query->ordered();
        });
    }

    public function scopeWithDefault(Builder $query)
    {
        if (!$query->getEagerLoads()) {
            $query->with($this->defaultWith);
        }
    }

    public function scopeCompleted($query)
    {
        // return $query->whereNotNull('completed_at');
    }

    public function scopePending($query)
    {
        // return $query->whereNull('completed_at');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function taskGroup(): BelongsTo
    {
        return $this->belongsTo(TaskGroup::class, 'group_id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function assignedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function inventoryAllocations(): HasMany
    {
        return $this->hasMany(InventoryTaskAllocation::class);
    }

    public function allocatedInventories(): BelongsToMany
    {
        return $this->belongsToMany(Inventory::class, 'inventory_task_allocations', 'task_id', 'inventory_id')
            ->withPivot([
                'quantity_allocated',
                'cost_at_allocation',
                'allocation_date',
                'notes',
                'allocated_by_user_id'
            ])
            ->withTimestamps();
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function subscribedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_user_subscriptions', 'task_id', 'user_id');
    }

    public function labels(): MorphToMany
    {
        return $this->morphToMany(Label::class,'labelable');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function dependencies(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'task_id', 'depends_on_task_id')
            ->using(\App\Models\TaskDependency::class)
            ->withPivot('relation_type_id', 'lag_days')
            ->withTimestamps();
    }
}
