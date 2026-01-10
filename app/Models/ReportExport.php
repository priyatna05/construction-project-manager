<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportExport extends Model
{
    protected $fillable = [
        'name',
        'report_type',
        'format',
        'template',
        'filters',
        'status',
        'file_path',
        'created_by_user_id',
        'started_at',
        'completed_at',
        'error_message',
    ];

    protected $casts = [
        'filters' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
