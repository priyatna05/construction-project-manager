<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class EvmCalculationService
{
    /**
     * Calculate Planned Value (PV) for a single task as of a specific date.
     * PV represents the budgeted cost of work scheduled.
     *
     * @param Task $task The task to calculate PV for.
     * @param Carbon $asOfDate The date to calculate PV as of.
     * @return float The planned value.
     */
    public function calculateTaskPv(Task $task, Carbon $asOfDate): float
    {
        $startDate = $task->start_date;
        $endDate = $task->end_date;
        $budget = (float) $task->budget_task;

        // If no start or end date, or budget is zero, or asOfDate is before start, PV is zero
        if (!$startDate || !$endDate || $budget == 0 || $asOfDate->lt($startDate)) {
            return 0.0;
        }
        // If asOfDate is after or equal to end date, PV is full budget
        if ($asOfDate->gte($endDate)) {
            return $budget;
        }

        // Calculate total duration in days and elapsed days as of asOfDate
        $totalDurationDays = $startDate->diffInDays($endDate) + 1;
        $elapsedDays = $startDate->diffInDays($asOfDate) + 1;

        // PV is proportional to elapsed days over total duration times budget
        return $totalDurationDays > 0 ? ($budget / $totalDurationDays) * $elapsedDays : $budget;
    }

    /**
     * Calculate Earned Value (EV) for a single task.
     * EV represents the budgeted cost of work actually performed.
     *
     * @param Task $task The task to calculate EV for.
     * @return float The earned value.
     */
    public function calculateTaskEv(Task $task): float
    {
        // EV is budget times progress percentage (0-100)
        return (float) $task->budget_task * ((float) $task->progress_task / 100);
    }

    /**
     * Calculate Actual Cost (AC) for a single task.
     * AC represents the actual cost incurred for work performed.
     *
     * @param Task $task The task to calculate AC for.
     * @return float The actual cost.
     */
    public function calculateTaskAc(Task $task): float
    {
        // Eager load timesheets and allocated inventories for performance
        $task->loadMissing(['timesheets', 'allocatedInventories']);

        // Sum labor cost from timesheets
        $laborCost = $task->timesheets->sum(function ($timesheet) {
            return (float) $timesheet->cost;
        });

        // Sum material cost from allocated inventories
        $materialCost = $task->allocatedInventories->sum(function ($inventory) {
            return (float) $inventory->quantity_allocation * (float) $inventory->unit_cost;
        });

        // Total actual cost is labor plus material cost
        return $laborCost + $materialCost;
    }

    /**
     * Calculate all core EVM metrics for a project.
     * Core metrics include PV, EV, AC, and BAC (budget at completion).
     *
     * @param Project $project The project to calculate metrics for.
     * @param Carbon $asOfDate The date to calculate metrics as of.
     * @return array Associative array with keys 'pv', 'ev', 'ac', 'bac'.
     */
    public function calculateProjectCoreMetrics(Project $project, Carbon $asOfDate): array
    {
        // Eager load timesheets and allocated inventories for all tasks
        $project->loadMissing('tasks.timesheets', 'tasks.allocatedInventories');

        $totalPv = 0;
        $totalEv = 0;
        $totalAc = 0;

        // Sum PV, EV, AC for all tasks
        foreach ($project->tasks as $task) {
            $totalPv += $this->calculateTaskPv($task, $asOfDate);
            $totalEv += $this->calculateTaskEv($task);
            $totalAc += $this->calculateTaskAc($task);
        }

        // Return rounded core metrics and BAC from project budget
        return [
            'pv' => round($totalPv, 2),
            'ev' => round($totalEv, 2),
            'ac' => round($totalAc, 2),
            'bac' => round((float) $project->budget, 2),
        ];
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
