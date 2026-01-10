<?php

namespace App\Jobs;

use App\Events\EvmUpdated;
use App\Models\Project;
use App\Models\Task;
use App\Services\EvmCalculationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class RecalculateEvmJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $project;

    /**
     * Constructor untuk job ini.
     */
    public function __construct(Project $project)
    {
        $this->project = $project;
    }

    /**
     * Eksekusi job: Hitung ulang EVM, simpan ke cache, dan broadcast update.
     */
    public function handle(EvmCalculationService $evmService)
    {
        // Load tasks once to avoid N+1 queries
        $tasks = Task::where('project_id', $this->project->id)->get();

        // Hitung metrics lengkap menggunakan service
        $metrics = $evmService->calculateMetrics($this->project);

        // Generate dan cache data untuk setiap periode
        $periods = ['day', 'week', 'month'];
        foreach ($periods as $period) {
            $data = $this->generateEvmDataForJob($this->project, $period, $evmService, $tasks);
            Cache::put("evm_{$this->project->id}_{$period}_v2", $data, 3600); // Cache 1 jam, gunakan key 'v2'
        }

        // Broadcast event untuk real-time update di frontend
        broadcast(new EvmUpdated($this->project->id, $metrics));
    }

    /**
     * Generate data EVM untuk chart berdasarkan periode.
     */
    private function generateEvmDataForJob(Project $project, string $period, EvmCalculationService $evmService, \Illuminate\Database\Eloquent\Collection $tasks): array
    {
        // Clean date strings to remove extra timezone info that causes parsing errors
        $cleanStartDate = preg_replace('/\s*\([^)]*\)$/', '', $project->start_date);
        $cleanEndDate = preg_replace('/\s*\([^)]*\)$/', '', $project->end_date ?? Carbon::now()->toISOString());

        $startDate = Carbon::parse($cleanStartDate);
        $endDate = Carbon::parse($cleanEndDate);

        if (!$startDate) {
            return [];
        }

        $data = [];
        $currentDate = $startDate->copy();
        $dayCounter = 1;
        $weekCounter = 1;

        while ($currentDate <= $endDate) {
            // Hitung metrics per tanggal menggunakan pre-loaded tasks
            $metrics = $evmService->calculateProjectCoreMetrics($project, $currentDate, $tasks);

            $data[] = [
                'date' => $currentDate->toISOString(), // Tetap gunakan ISO string untuk konsistensi
                'displayDate' => $this->getDisplayDate($currentDate, $period, $project, $dayCounter, $weekCounter),
                'PV' => $metrics['pv'],
                'EV' => $metrics['ev'],
                'AC' => $metrics['ac'],
                'BAC' => $metrics['bac'],
            ];

            // Increment berdasarkan periode
            switch ($period) {
                case 'day':
                    $currentDate->addDay();
                    $dayCounter++;
                    break;
                case 'week':
                    $currentDate->addWeek();
                    $weekCounter++;
                    break;
                case 'month':
                    $currentDate->addMonth();
                    break;
            }
        }

        return $data;
    }

    /**
     * Mendapatkan format display date berdasarkan periode.
     * Disamakan dengan EvmRecordController.
     */
    private function getDisplayDate(Carbon $date, string $period, Project $project, int $dayCounter = null, int $weekCounter = null): string
    {
        switch ($period) {
            case 'day':
                return 'Day ' . $dayCounter;

            case 'week':
                return 'Week ' . $weekCounter;

            case 'month':
                return $date->format('M Y'); // contoh: "Jan 2025"

            default:
                return $date->toDateString();
        }
    }
}
