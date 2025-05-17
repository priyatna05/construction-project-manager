<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvmRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'plannedValue',
        'earnedValue',
        'actualCost',
        'scheduleVariance',
        'costVariance',
        'schedulePerformanceIndex',
        'costPerformanceIndex',
        'estimateAtCompletion',
        'estimateToComplete',
        'varianceAtCompletion',
        'varianceToComplete',
    ];

     public static function EvmRecord(): BelongToMany
    {
        return self::orderBy('EvmRecord')->pluck('ProjectID', 'id')->toArray();
    }
}
