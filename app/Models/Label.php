<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use Illuminate\Database\Eloquent\SoftDeletes;
use LaravelArchivable\Archivable;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $type
 * @property string|null $color
 * @property string|null $icon
 * @property int $is_default
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Project> $projects
 * @property-read int|null $projects_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Task> $tasks
 * @property-read int|null $tasks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label search(?string $search, ?array $searchable = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label searchByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label sort(?array $sort = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label sortByQueryString()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label taskRelation()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereArchivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Label whereUpdatedAt($value)
 * @mixin \Eloquent
 * @mixin IdeHelperLabel
 */
class Label extends Model
{
    use Archivable, IsSearchable, IsSortable, SoftDeletes;

    public const TYPE_PROJECT_TASK_STATUS     = 'pt_status';
    public const TYPE_PROJECT_TASK_BILLING_STATUS     = 'ptb_status';
    public const TYPE_TASK_RELATION     = 'task_relation';
    public const TYPE_INVENTORY_STATUS  = 'inventory_status_label';
    public const TYPE_INVENTORY_TYPE    = 'inventory_type_label';
    public const TYPE_TASK_INVENTORY_UNIT    = 'task_inventory_unit_label';
    public const TYPE_TASK    = 'task_type_label';
    public const TYPE_KONTRAK    = 'kontrak_label';
    public const TYPE_WORK_REPORT_STATUS    = 'work_report_status';
    public const TYPE_PRIORITY    = 'task_priority_label';

    protected $fillable = [
        'name',
        'slug',
        'type',
        'color',
        'icon',
        'is_default',
        'archived_at',
    ];


    protected $searchable = ['name'];
    protected $sortable = ['name' => 'asc'];
    protected $archivable = ['archived_at'];


    // relations
    public function projects(): MorphToMany
    {
        return $this->morphedByMany(Project::class, 'labelable');
    }

    public function tasks(): MorphToMany
    {
        return $this->morphedByMany(Task::class, 'labelable');
    }

    public function inventories(): MorphToMany
    {
        return $this->morphedByMany(Inventory::class, 'labelable');
    }

    public function workReports(): MorphToMany
    {
        return $this->morphedByMany(WorkReport::class, 'labelable');
    }

    // scope
    public function scopeTaskRelation($query)
    {
        return $query->where('type', self::TYPE_TASK_RELATION);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public static function slugsForType(string $type): array
    {
        return self::where('type', $type)->pluck('slug')->toArray();
    }

    public static function slugsForTypeString(string $type): string
    {
        return implode(',', self::slugsForType($type));
    }
}
