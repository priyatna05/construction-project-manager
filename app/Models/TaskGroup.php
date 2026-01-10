<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use LaravelArchivable\Archivable;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

/**
 * @property int $id
 * @property int $project_id
 * @property string $name
 * @property string|null $description
 * @property int $order_column
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @property string|null $deleted_at
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \OwenIt\Auditing\Models\Audit> $audits
 * @property-read int|null $audits_count
 * @property-read \App\Models\Project $project
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $tasks
 * @property-read int|null $tasks_count
 * @method static \Database\Factories\TaskGroupFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup ordered(string $direction = 'asc')
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereBudgetGroup($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereOrderColumn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereProgressGroup($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskGroup whereWeightGroup($value)
 * @mixin \Eloquent
 * @mixin IdeHelperTaskGroup
 */
class TaskGroup extends Model implements AuditableContract, Sortable
{
    use Archivable, Auditable, HasFactory, SortableTrait;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'project_id',
        'order_column',
    ];


    protected $searchable = ['project_id', 'order_column'];

    protected $observables = ['archived', 'unArchived', 'deleted'];

    protected static function booted(): void
    {
        static::addGlobalScope('ordered', function ($query) {
            $query->ordered();
        });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'group_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
