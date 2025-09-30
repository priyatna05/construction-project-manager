<?php

namespace App\Models;

use App\Models\Filters\WhereInFilter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Lacodix\LaravelModelFilter\Traits\HasFilters;

/**
 * @property int $id
 * @property int|null $project_id
 * @property int|null $user_id
 * @property string $title
 * @property string|null $description
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property array<array-key, mixed>|null $properties
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \App\Models\Project|null $project
 * @property-read Model|\Eloquent|null $subject
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity filter(array $values, string $group = '__default')
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity filterByQueryString(string $group = '__default')
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereProperties($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereSubjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereSubjectType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereUserId($value)
 * @mixin \Eloquent
 * @mixin IdeHelperActivity
 */
class Activity extends Model
{
    use HasFilters;

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'project_id',
        'title',
        'description',
        'created_at',
        'properties',
    ];

    protected $casts = [
    'properties' => 'array',
];

    public function filters(): array
    {
        return [
            (new WhereInFilter('project_id'))->setQueryName('project'),
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}
