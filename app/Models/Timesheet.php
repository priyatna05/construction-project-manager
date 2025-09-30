<?php

namespace App\Models;

use App\Models\Task;
use App\Models\User;
use App\Models\Project;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property int $user_id
 * @property int $task_id
 * @property int $project_id
 * @property \Illuminate\Support\Carbon $entry_date
 * @property numeric $hours_worked
 * @property numeric|null $hourly_rate
 * @property numeric $cost
 * @property string|null $description
 * @property string|null $status
 * @property int|null $approved_by_user_id
 * @property \Illuminate\Support\Carbon|null $approved_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property-read User|null $approver
 * @property-read mixed $cost_formatted
 * @property-read string $status_label
 * @property-read Project $project
 * @property-read Task $task
 * @property-read User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet approved()
 * @method static \Database\Factories\TimesheetFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereApprovedByUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereEntryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereHourlyRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereHoursWorked($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Timesheet whereUserId($value)
 * @mixin \Eloquent
 * @mixin IdeHelperTimesheet
 */
class Timesheet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'project_id',
        'entry_date',
        'hours_worked',
        'hourly_rate',
        'cost',
        'description',
        'status',
        'approved_by_user_id',
        'approved_at',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'hours_worked' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'cost' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    protected $guarded = ['id'];
    const STATUS_PENDING = 'Pending';
    const STATUS_APPROVED = 'Approved';
    const STATUS_REJECTED = 'Rejected';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function getStatusLabelAttribute(): string
    {
        return ucfirst(strtolower($this->status));
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function getCostFormattedAttribute()
    {
        return number_format($this->cost, 2, ',', '.');
    }
}
