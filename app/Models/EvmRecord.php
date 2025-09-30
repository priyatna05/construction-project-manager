<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $project_id
 * @property \Illuminate\Support\Carbon $report_date
 * @property string|null $budget_at_completion
 * @property string|null $planned_value
 * @property string|null $earned_value
 * @property string|null $actual_cost
 * @property string|null $schedule_variance
 * @property string|null $cost_variance
 * @property string|null $schedule_performance_index
 * @property string|null $cost_performance_index
 * @property string|null $estimate_at_completion
 * @property string|null $estimate_to_complete
 * @property string|null $variance_at_completion
 * @property string|null $tcpi_bac
 * @property string|null $tcpi_eac
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property-read \App\Models\Project $project
 * @method static \Database\Factories\EvmRecordFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereActualCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereBudgetAtCompletion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereCostPerformanceIndex($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereCostVariance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereEarnedValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereEstimateAtCompletion($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereEstimateToComplete($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord wherePlannedValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereReportDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereSchedulePerformanceIndex($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereScheduleVariance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereTcpiBac($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereTcpiEac($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EvmRecord whereVarianceAtCompletion($value)
 * @mixin \Eloquent
 * @mixin IdeHelperEvmRecord
 */
class EvmRecord extends Model
{
    use HasFactory;
    protected $table = 'evm_records';
    protected $fillable = [
        'project_id',
        'report_date',
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

    protected $casts = [
        'report_date' => 'date',
        'plannedValue' => 'decimal:2',
        'earnedValue' => 'decimal:2',
        'actualCost' => 'decimal:2',
        'scheduleVariance' => 'decimal:2',
        'costVariance' => 'decimal:2',
        'schedulePerformanceIndex' => 'decimal:4',
        'costPerformanceIndex' => 'decimal:4',
        'budgetAtCompletion' => 'decimal:2',
        'estimateAtCompletion' => 'decimal:2',
        'estimateToComplete' => 'decimal:2',
        'varianceAtCompletion' => 'decimal:2',
    ];

     public function project()
    {
        return $this->belongsTo(Project::class);
    }

}
