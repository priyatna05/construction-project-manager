<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;

class EvmCalculationService
{

    /**
     * Calculate Planned Value (PV) for a single task as of a specific date.
     * PV represents the budgeted cost of work scheduled.
     * BCWS = % Progress Pekerjaan yang direncanakan pada durasi waktu tertentu x BAC
     * @param Task $task The task to calculate PV for.
     * @param Carbon $asOfDate The date to calculate PV as of.
     * @return float The planned value.
     */
    public function calculatePv(Task $task, Carbon $asOfDate, float $bac, float $totalWeight): float
    {
        if (!$task->start_date || !$task->end_date || !$task->weight_task) return 0;

        // Clean date strings to remove extra timezone info that causes parsing errors
        $startDateStr = preg_replace('/\s*\([^)]*\)$/', '', $task->start_date);
        $endDateStr = preg_replace('/\s*\([^)]*\)$/', '', $task->end_date);

        $start = Carbon::parse($startDateStr);
        $end = Carbon::parse($endDateStr);
        $totalDuration = max($start->diffInDays($end), 1);

        // Gunakan selisih bertanda supaya tanggal sebelum start tidak menghasilkan progres
        $elapsed = $start->diffInDays(min($asOfDate, $end), false);
        $elapsed = max(min($elapsed, $totalDuration), 0);
        $plannedProgress = $elapsed / $totalDuration;

        // proporsional berdasarkan bobot task
        $taskBAC = ($task->weight_task / $totalWeight) * $bac;

        return round($taskBAC * $plannedProgress, 2);
    }


    /**
     * Calculate Earned Value (EV) for a single task.
     * EV represents the budgeted cost of work actually performed.
     *BCWP = % Progress Pekerjaan yang telah diselesaikan pada durasi waktu tertentu x BAC
     * @param Task $task The task to calculate EV for.
     * @return float The earned value.
     */
    public function calculateEv(Task $task, float $bac, float $totalWeight): float
    {
        if (!$task->progress_task || !$task->weight_task) return 0;

        $taskBAC = ($task->weight_task / $totalWeight) * $bac;

        return round($taskBAC * ($task->progress_task / 100), 2);
    }

    /** Sum(budget_task_actual)
     * Calculate Actual Cost (AC) for a single task.
     * AC represents the actual cost incurred for work performed.
     * ACWP = Seluruh Biaya Pengeluaran Proyek sampai Durasi Waktu Tertentu
     * @param Task $task The task to calculate AC for.
     * @return float The actual cost.
     */
    public function calculateAC(Task $task): float
    {
        return round($task->budget_task_actual ?? 0, 2);
    }

    /**
     * Resolve BAC (Budget at Completion) as total contract value before VAT/PPN.
     * Priority:
     * 1) budget_project_estimate (contract value)
     * 2) budget_project_grandtotal_plan minus tax_cost_plan (pre-tax total)
     * 3) budget_project_final_plan
     * 4) sum of budget_task_plan
     *
     * @param Project $project
     * @param \Illuminate\Database\Eloquent\Collection $tasks
     * @return float
     */
    private function resolveBac(Project $project, \Illuminate\Database\Eloquent\Collection $tasks): float
    {
        $estimate = $project->budget_project_estimate;
        if (!is_null($estimate) && $estimate > 0) {
            return round((float) $estimate, 2);
        }

        $grandTotalPlan = $project->budget_project_grandtotal_plan;
        if (!is_null($grandTotalPlan) && $grandTotalPlan > 0) {
            $taxPlan = $project->tax_cost_plan ?? 0;
            $preTaxPlan = (float) $grandTotalPlan - (float) $taxPlan;
            if ($preTaxPlan > 0) {
                return round($preTaxPlan, 2);
            }
        }

        $finalPlan = $project->budget_project_final_plan;
        if (!is_null($finalPlan) && $finalPlan > 0) {
            return round((float) $finalPlan, 2);
        }

        return round($tasks->sum('budget_task_plan'), 2);
    }


    /**
     * Calculate all core EVM metrics for a project.
     * Core metrics include PV, EV, AC, and BAC (budget at completion).
     * BAC = total contract value before VAT/PPN.
     * @param Project $project The project to calculate metrics for.
     * @param Carbon $asOfDate The date to calculate metrics as of.
     * @param \Illuminate\Database\Eloquent\Collection|null $tasks Pre-loaded tasks collection (optional, will load if not provided)
     * @return array Associative array with keys 'pv', 'ev', 'ac', 'bac'.
     */
    public function calculateProjectCoreMetrics(Project $project, Carbon $asOfDate, ?\Illuminate\Database\Eloquent\Collection $tasks = null): array
    {
        if ($tasks === null) {
            $tasks = Task::where('project_id', $project->id)->get();
        }

        if ($tasks->isEmpty()) {
            return ['pv' => 0, 'ev' => 0, 'ac' => 0, 'bac' => 0];
        }

        $bac = $this->resolveBac($project, $tasks);
        $totalWeight = max($tasks->sum('weight_task'), 1); // pastikan tidak 0

        $pv = $ev = $ac = 0;

        foreach ($tasks as $task) {
            $pv += $this->calculatePv($task, $asOfDate, $bac, $totalWeight);
            $ev += $this->calculateEv($task, $bac, $totalWeight);
            $ac += $this->calculateAC($task);
        }

        return compact('pv', 'ev', 'ac', 'bac');
    }


    /**
     * Calculate derived EVM metrics for a project.
     * SV (Schedule Variance) = EV - PV
     * CV (Cost Variance) = EV - AC
     * SPI (Schedule Performance Index) = EV / PV
     * CPI (Cost Performance Index) = EV / AC
     * EAC (Estimate at Completion) = BAC / CPI (if CPI > 0)
     * ETC (Estimate to Complete) = EAC - AC
     * VAC (Variance at Completion) = BAC - EAC
     *
     * @param float $pv Planned Value
     * @param float $ev Earned Value
     * @param float $ac Actual Cost
     * @param float $bac Budget at Completion
     * @return array Associative array with derived metrics.
     */
    public function calculateProjectDerivedMetrics(float $pv, float $ev, float $ac, float $bac): array
    {
        $sv = round($ev - $pv, 2); // Schedule Variance: positive means ahead of schedule
        $cv = round($ev - $ac, 2); // Cost Variance: positive means under budget
        $spi = ($pv != 0) ? round($ev / $pv, 2) : null; // Schedule Performance Index: >1 means ahead of schedule
        $cpi = ($ac != 0) ? round($ev / $ac, 2) : null; // Cost Performance Index: >1 means under budget

        $eac = null;
        if ($cpi && $cpi != 0 && $bac != 0) {
            // Estimate at Completion based on cost performance
            $eac = round($bac / $cpi, 2);
        } elseif ($ac != 0 && $bac != 0 && $ev != 0) {
            // Alternate EAC formula
            $eac = round($ac + ($bac - $ev), 2);
        }

        $etc = null;
        if ($eac !== null) {
            // Estimate to Complete: remaining cost to finish project
            $etc = round($eac - $ac, 2);
        } elseif ($cpi && $cpi != 0 && $bac != 0 && $ev != 0) {
            $etc = round(($bac - $ev) / $cpi, 2);
        }

        $vac = ($eac !== null && $bac != 0) ? round($bac - $eac, 2) : null; // Variance at Completion

        return compact('sv', 'cv', 'spi', 'cpi', 'eac', 'etc', 'vac');
    }

    /**
     * Calculate all EVM metrics for a project and return combined data.
     * This method integrates core and derived metrics and returns a comprehensive array.
     *
     * @param Project $project The project to calculate metrics for.
     * @return array Combined metrics and project data.
     */
    public function calculateMetrics(Project $project): array
    {
        $asOfDate = Carbon::now();

        // Calculate core metrics
        $coreMetrics = $this->calculateProjectCoreMetrics($project, $asOfDate);

        // Calculate derived metrics
        $derivedMetrics = $this->calculateProjectDerivedMetrics(
            $coreMetrics['pv'],
            $coreMetrics['ev'],
            $coreMetrics['ac'],
            $coreMetrics['bac']
        );

        // Combine all metrics with project basic info
        return array_merge(
            $project->toArray(),
            $coreMetrics,
            $derivedMetrics
        );
    }
}
