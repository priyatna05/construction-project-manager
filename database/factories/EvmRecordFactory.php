<?php

namespace Database\Factories;

use App\Models\EvmRecord;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class EvmRecordFactory extends Factory
{
    protected $model = EvmRecord::class;

    /**
     * Definisi default HANYA berisi nilai-nilai sederhana sebagai fallback.
     * Ini digunakan jika factory dipanggil tanpa state kustom.
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'report_date' => now(),
            'budget_at_completion' => 0,
            'planned_value' => 0,
            'earned_value' => 0,
            'actual_cost' => 0,
            'schedule_variance' => 0,
            'cost_variance' => 0,
            'notes' => $this->faker->optional()->sentence,
        ];
    }

    /**
     * Sebuah state kustom untuk melakukan semua kalkulasi kompleks.
     * Ini adalah "pintu masuk" utama untuk membuat record EVM yang valid.
     *
     * @param  \App\Models\Project  $project
     * @param  \Illuminate\Support\Carbon  $reportDate
     * @return static
     */
    public function withCalculationsFor(Project $project, Carbon $reportDate): static
    {
        return $this->state(function (array $attributes) use ($project, $reportDate) {

            // --- Di sinilah semua logika perhitungan Anda ditempatkan ---

            $projectStart = Carbon::parse($project->start_date);
            $projectEnd = Carbon::parse($project->end_date);
            $budgetAtCompletion = $project->budget_project;

            // Planned Value (PV)
            $totalDuration = $projectEnd->diffInDays($projectStart);
            $elapsedDurationToReport = $reportDate->diffInDays($projectStart);
            $plannedPercentComplete = ($totalDuration > 0) ? min(100, ($elapsedDurationToReport / $totalDuration) * 100) : 0;
            $plannedValue = $budgetAtCompletion * ($plannedPercentComplete / 100);

            // Earned Value (EV)
            $earnedValue = $budgetAtCompletion * ($project->progress_project / 100);

            // Actual Cost (AC)
            $actualCost = $earnedValue > 0 ? $earnedValue * $this->faker->randomFloat(2, 0.9, 1.15) : 0;

            // Metrik EVM Lainnya
            $costVariance = $earnedValue - $actualCost;
            $scheduleVariance = $earnedValue - $plannedValue;
            $costPerformanceIndex = ($actualCost > 0) ? ($earnedValue / $actualCost) : null;
            $schedulePerformanceIndex = ($plannedValue > 0) ? ($earnedValue / $plannedValue) : null;
            $estimateAtCompletion = ($costPerformanceIndex && $costPerformanceIndex > 0) ? ($budgetAtCompletion / $costPerformanceIndex) : null;
            $estimateToComplete = $estimateAtCompletion ? ($estimateAtCompletion - $actualCost) : null;
            $varianceAtCompletion = ($budgetAtCompletion && $estimateAtCompletion) ? ($budgetAtCompletion - $estimateAtCompletion) : null;
            $tcpi_bac = (($budgetAtCompletion - $actualCost) != 0) ? (($budgetAtCompletion - $earnedValue) / ($budgetAtCompletion - $actualCost)) : null;
            $tcpi_eac = ($estimateAtCompletion && ($estimateAtCompletion - $actualCost) != 0) ? (($budgetAtCompletion - $earnedValue) / ($estimateAtCompletion - $actualCost)) : null;

            // Kembalikan array yang HANYA berisi nama kolom yang valid
            return [
                'project_id' => $project->id,
                'report_date' => $reportDate->toDateString(),
                'budget_at_completion' => $budgetAtCompletion / 100,
                'planned_value' => round($plannedValue / 100, 2),
                'earned_value' => round($earnedValue / 100, 2),
                'actual_cost' => round($actualCost / 100, 2),
                'schedule_variance' => round($scheduleVariance / 100, 2),
                'cost_variance' => round($costVariance / 100, 2),
                'estimate_at_completion' => $estimateAtCompletion ? round($estimateAtCompletion / 100, 2) : null,
                'estimate_to_complete' => $estimateToComplete ? round($estimateToComplete / 100, 2) : null,
                'variance_at_completion' => $varianceAtCompletion ? round($varianceAtCompletion / 100, 2) : null,
                'schedule_performance_index' => $schedulePerformanceIndex ? round($schedulePerformanceIndex, 4) : null,
                'cost_performance_index' => $costPerformanceIndex ? round($costPerformanceIndex, 4) : null,
                'tcpi_bac' => $tcpi_bac ? round($tcpi_bac, 4) : null,
                'tcpi_eac' => $tcpi_eac ? round($tcpi_eac, 4) : null,
            ];
        });
    }
}
