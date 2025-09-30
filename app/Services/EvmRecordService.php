<?php

namespace App\Services;

use App\Models\Project;
use App\Models\EvmRecord;
use Carbon\Carbon;

class EvmRecordService
{
    protected EvmCalculationService $evmCalculationService;

    public function __construct()
    {
        $this->evmCalculationService = new EvmCalculationService();
    }

    /**
     * Calculate and save or update EvmRecord for a given project as of today.
     *
     * @param Project $project
     * @return EvmRecord
     */
    public function calculateAndSave(Project $project): EvmRecord
    {
        $metrics = $this->evmCalculationService->calculateMetrics($project);

        $recordDate = Carbon::now()->startOfDay();

        // Find existing record for today or create new
        $evmRecord = EvmRecord::firstOrNew([
            'project_id' => $project->id,
            'report_date' => $recordDate,
        ]);

        // Fill EvmRecord fields from calculated metrics
        $evmRecord->planned_value = $metrics['pv'];
        $evmRecord->earned_value = $metrics['ev'];
        $evmRecord->actual_cost = $metrics['ac'];
        $evmRecord->budget_at_completion = $metrics['bac'];
        $evmRecord->schedule_variance = $metrics['sv'];
        $evmRecord->cost_variance = $metrics['cv'];
        $evmRecord->schedule_performance_index = $metrics['spi'];
        $evmRecord->cost_performance_index = $metrics['cpi'];
        $evmRecord->estimate_at_completion = $metrics['eac'];
        $evmRecord->estimate_to_complete = $metrics['etc'];
        $evmRecord->variance_at_completion = $metrics['vac'];

        $evmRecord->save();

        // Broadcast event for real-time update
        event(new \App\Events\Analytic\EvmRecordUpdated($evmRecord));

        return $evmRecord;
    }

    /**
     * Calculate and save EvmRecords for all projects.
     *
     * @return void
     */
    public function calculateAndSaveAll(): void
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            $this->calculateAndSave($project);
        }
    }
}
