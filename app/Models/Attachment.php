<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $project_id
 * @property int|null $task_id
 * @property int $user_id
 * @property string $name
 * @property string $path
 * @property string $thumb
 * @property string $disk
 * @property string|null $mime_type
 * @property int $size
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Project|null $project
 * @property-read \App\Models\Task|null $task
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereDisk($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereMimeType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment wherePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereThumb($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attachment whereUserId($value)
 * @mixin \Eloquent
 * @mixin IdeHelperAttachment
 */
class Attachment extends Model
{
    protected $fillable = [
        'project_id',
        'task_id',
        'user_id',
        'name',
        'path',
        'thumb',
        'disk',
        'mime_type',
        'file_type',
        'size',
        'is_main',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workReport(): BelongsTo
    {
        return $this->belongsTo(WorkReport::class);
    }
}
