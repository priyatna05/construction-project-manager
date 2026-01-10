<?php

namespace App\Http\Controllers;

use App\Events\EvmUpdated;
use App\Jobs\RecalculateEvmJob;
use App\Models\Project;
use App\Models\Task;
use App\Services\EvmCalculationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class EvmRecordController extends Controller
{
    protected $evmService;

    public function __construct(EvmCalculationService $evmService)
    {
        $this->evmService = $evmService;
        $this->authorizeResource(Project::class, 'project');
    }

    /**
     * Data diambil dari cache jika ada, jika tidak generate ulang.
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        $period = $request->query('period', 'month'); // day, week, month

        $cacheKey = "evm_{$project->id}_{$period}_v2";
        $data = Cache::get($cacheKey);

        if (!$data) {
            // Jika tidak ada di cache, generate data
            $project->load(['tasks.allocatedInventories', 'tasks.workReports']);
            $data = $this->generateEvmData($project, $period);
            Cache::put($cacheKey, $data, 3600); // Cache selama 1 jam
        }

        return response()->json($data);
    }

    /**
     * Generate data EVM berdasarkan project dan periode.
     * Data dihitung secara real-time dari tasks, work reports, dll.
     */
    private function generateEvmData(Project $project, string $period): array
    {
        // Clean date strings to remove extra timezone info that causes parsing errors
        $cleanStartDate = preg_replace('/\s*\([^)]*\)$/', '', $project->start_date);
        $cleanEndDate = preg_replace('/\s*\([^)]*\)$/', '', $project->end_date ?? Carbon::now()->toISOString());

        $startDate = Carbon::parse($cleanStartDate);
        $endDate = Carbon::parse($cleanEndDate);

        if (!$startDate) {
            return [];
        }

        // Load tasks once to avoid N+1 queries
        $tasks = Task::where('project_id', $project->id)->get();

        $data = [];
        $currentDate = $startDate->copy();
        $dayCounter = 1;
        $weekCounter = 1;

        while ($currentDate <= $endDate) {
            // Hitung metrics per tanggal menggunakan EvmCalculationService dengan pre-loaded tasks
            $metrics = $this->evmService->calculateProjectCoreMetrics($project, $currentDate, $tasks);

            $data[] = [
                'date' => $currentDate->toISOString(),
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

            case 'quarter':
                return 'Q' . $date->quarter . ' ' . $date->year; // tambahan jika perlu

            default:
                return $date->toDateString(); // fallback: "2025-11-04"
        }
    }


    /**
     * Trigger manual recalculation EVM untuk project (opsional, untuk testing).
     */
    public function recalculate(Request $request): JsonResponse
    {
        $projectId = $request->query('project_id');
        $project = Project::findOrFail($projectId);

        // Dispatch job untuk kalkulasi async
        RecalculateEvmJob::dispatch($project);

        return response()->json(['message' => 'EVM recalculation queued']);
    }
}
