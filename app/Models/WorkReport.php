<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class WorkReport extends Model
{

    protected $fillable = [
        'task_id',
        'user_id',
        'name',
        'report_date',
        'progress',
        'work_done',
        'unit_id',
        'actual_cost',
        'actual_unit_cost',
        'labor_details',
        'material_details',
        'equipment_details',
        'remarks',
        'weather',
    ];

    protected $casts = [
        'report_date' => 'date',
        'labor_details' => 'array',
        'material_details' => 'array',
        'equipment_details' => 'array',
    ];

    public array $defaultWith = [
        'user:id,name,avatar',
        'labels:id,name,color,icon',
        'unitLabel:id,name',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function labels(): MorphToMany
    {
        return $this->morphToMany(Label::class, 'labelable');
    }

    public function getStatusLabelAttribute(): ?Label
    {
        return $this->labels->where('type', Label::TYPE_WORK_REPORT_STATUS)->first();
    }

    public function unitLabel(): BelongsTo
    {
        return $this->belongsTo(Label::class, 'unit_id');
    }

    public function loadDefault()
    {
        return $this->load($this->defaultWith);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}
