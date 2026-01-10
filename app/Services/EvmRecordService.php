<?php

namespace App\Services;

use App\Models\Project;
use App\Models\EvmRecord;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;

class EvmRecordService
{
    protected EvmCalculationService $evmCalculationService;
    /** @var callable */
    protected $recordResolver;
    /** @var callable */
    protected $recipientResolver;

    public function __construct(?EvmCalculationService $evmCalculationService = null, ?callable $recordResolver = null, ?callable $recipientResolver = null)
    {
        $this->evmCalculationService = $evmCalculationService ?? new EvmCalculationService();
        $this->recordResolver = $recordResolver ?? function (int $projectId, Carbon $recordDate) {
            return EvmRecord::firstOrNew([
                'project_id' => $projectId,
                'report_date' => $recordDate,
            ]);
        };
        $this->recipientResolver = $recipientResolver ?? function (Project $project) {
            return $this->defaultRecipients($project);
        };
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
        $status = $this->buildStatusNotes($metrics);

        $recordDate = Carbon::now()->startOfDay();

        // Find existing record for today or create new
        $evmRecord = call_user_func($this->recordResolver, $project->id, $recordDate);

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
        $evmRecord->notes = $status['notes'];

        $evmRecord->save();

        $this->dispatchAlerts($project, $metrics, $evmRecord, $status);

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

    private function dispatchAlerts(Project $project, array $metrics, EvmRecord $evmRecord, array $status): void
    {
        if (!config('evm.notify_enabled', false)) {
            return;
        }

        $triggers = $status['risk_flags'] ?? [];
        if (!is_null($metrics['eac']) && !is_null($metrics['bac']) && $metrics['eac'] > $metrics['bac']) {
            $triggers[] = ['type' => 'eac_over_bac', 'value' => $metrics['eac'], 'bac' => $metrics['bac']];
        }

        if (empty($triggers)) {
            return;
        }

        /** @var Collection<int, User> $recipients */
        $recipients = call_user_func($this->recipientResolver, $project);

        if ($recipients->isEmpty()) {
            return;
        }

        Notification::send(
            $recipients,
            new \App\Notifications\EvmRecordNotification(
                $project,
                $metrics,
                $triggers,
                $evmRecord->id,
                $status
            )
        );
    }

    private function defaultRecipients(Project $project): Collection
    {
        return User::role(['admin', 'manager'])->get()->unique('id');
    }

    /**
     * Build human-readable status notes and risk flags for CV, SV, CPI, SPI.
     *
     * @param array $metrics
     * @return array{notes:string, summary:string, risk_flags:array<int,array>, at_risk:bool}
     */
    private function buildStatusNotes(array $metrics): array
    {
        $cvInfo = $this->describeCostVariance($metrics['cv'] ?? null);
        $svInfo = $this->describeScheduleVariance($metrics['sv'] ?? null);
        $cpiInfo = $this->describeCpi($metrics['cpi'] ?? null);
        $spiInfo = $this->describeSpi($metrics['spi'] ?? null);

        $notes = implode("\n", [
            $cvInfo['detail'],
            $svInfo['detail'],
            $cpiInfo['detail'],
            $spiInfo['detail'],
        ]);

        $summary = implode(' | ', [
            $cvInfo['summary'],
            $svInfo['summary'],
            $cpiInfo['summary'],
            $spiInfo['summary'],
        ]);

        $riskFlags = array_values(array_filter([
            $cvInfo['risk'] ? ['type' => 'cv_negative', 'value' => $metrics['cv'] ?? null] : null,
            $svInfo['risk'] ? ['type' => 'sv_negative', 'value' => $metrics['sv'] ?? null] : null,
            $cpiInfo['risk'] ? ['type' => 'cpi_below_one', 'value' => $metrics['cpi'] ?? null] : null,
            $spiInfo['risk'] ? ['type' => 'spi_below_one', 'value' => $metrics['spi'] ?? null] : null,
        ]));

        return [
            'notes' => $notes,
            'summary' => $summary,
            'risk_flags' => $riskFlags,
            'at_risk' => !empty($riskFlags),
        ];
    }

    private function describeCostVariance(?float $cv): array
    {
        if ($cv === null) {
            return [
                'summary' => 'CV: n/a',
                'detail' => 'Cost Variance (CV): not available.',
                'risk' => false,
            ];
        }

        if ($this->isZero($cv)) {
            return [
                'summary' => 'CV: 0.00 (On budget)',
                'detail' => 'Cost Variance (CV): 0.00. Earned value equals actual cost (On budget).',
                'risk' => false,
            ];
        }

        if ($cv > 0) {
            $value = $this->formatSignedValue($cv);
            return [
                'summary' => "CV: {$value} (Cost saving)",
                'detail' => "Cost Variance (CV): {$value}. Earned value exceeds actual cost (Cost saving).",
                'risk' => false,
            ];
        }

        $value = $this->formatSignedValue($cv);
        return [
            'summary' => "CV: {$value} (Cost overrun)",
            'detail' => "Cost Variance (CV): {$value}. Earned value is below actual cost (Cost overrun).",
            'risk' => true,
        ];
    }

    private function describeScheduleVariance(?float $sv): array
    {
        if ($sv === null) {
            return [
                'summary' => 'SV: n/a',
                'detail' => 'Schedule Variance (SV): not available.',
                'risk' => false,
            ];
        }

        if ($this->isZero($sv)) {
            return [
                'summary' => 'SV: 0.00 (On time)',
                'detail' => 'Schedule Variance (SV): 0.00. Actual progress matches the plan (On time).',
                'risk' => false,
            ];
        }

        if ($sv > 0) {
            $value = $this->formatSignedValue($sv);
            return [
                'summary' => "SV: {$value} (Ahead of schedule)",
                'detail' => "Schedule Variance (SV): {$value}. Actual progress is ahead of plan (Ahead of schedule).",
                'risk' => false,
            ];
        }

        $value = $this->formatSignedValue($sv);
        return [
            'summary' => "SV: {$value} (Delayed)",
            'detail' => "Schedule Variance (SV): {$value}. Actual progress is behind plan (Delayed).",
            'risk' => true,
        ];
    }

    private function describeCpi(?float $cpi): array
    {
        if ($cpi === null) {
            return [
                'summary' => 'CPI: n/a',
                'detail' => 'Cost Performance Index (CPI): not available.',
                'risk' => false,
            ];
        }

        if ($this->isZero($cpi - 1)) {
            $value = $this->formatMetricValue($cpi);
            return [
                'summary' => "CPI: {$value} (On budget)",
                'detail' => "Cost Performance Index (CPI): {$value}. On budget.",
                'risk' => false,
            ];
        }

        if ($cpi > 1) {
            $value = $this->formatMetricValue($cpi);
            return [
                'summary' => "CPI: {$value} (Cost efficient)",
                'detail' => "Cost Performance Index (CPI): {$value}. Good cost performance (Cost efficient).",
                'risk' => false,
            ];
        }

        $value = $this->formatMetricValue($cpi);
        return [
            'summary' => "CPI: {$value} (Over budget)",
            'detail' => "Cost Performance Index (CPI): {$value}. Poor cost performance (Over budget).",
            'risk' => true,
        ];
    }

    private function describeSpi(?float $spi): array
    {
        if ($spi === null) {
            return [
                'summary' => 'SPI: n/a',
                'detail' => 'Schedule Performance Index (SPI): not available.',
                'risk' => false,
            ];
        }

        if ($this->isZero($spi - 1)) {
            $value = $this->formatMetricValue($spi);
            return [
                'summary' => "SPI: {$value} (On schedule)",
                'detail' => "Schedule Performance Index (SPI): {$value}. On schedule.",
                'risk' => false,
            ];
        }

        if ($spi > 1) {
            $value = $this->formatMetricValue($spi);
            return [
                'summary' => "SPI: {$value} (Ahead of schedule)",
                'detail' => "Schedule Performance Index (SPI): {$value}. Good schedule performance (Ahead of schedule).",
                'risk' => false,
            ];
        }

        $value = $this->formatMetricValue($spi);
        return [
            'summary' => "SPI: {$value} (Behind schedule)",
            'detail' => "Schedule Performance Index (SPI): {$value}. Poor schedule performance (Behind schedule).",
            'risk' => true,
        ];
    }

    private function formatSignedValue(?float $value, int $decimals = 2): string
    {
        if ($value === null) {
            return 'n/a';
        }
        $number = round($value, $decimals);
        $prefix = $number > 0 ? '+' : ($number < 0 ? '-' : '');
        return $prefix . number_format(abs($number), $decimals, '.', ',');
    }

    private function formatMetricValue(?float $value, int $decimals = 2): string
    {
        if ($value === null) {
            return 'n/a';
        }
        return number_format((float) $value, $decimals, '.', ',');
    }

    private function isZero(?float $value, int $precision = 2): bool
    {
        if ($value === null) {
            return false;
        }
        return abs(round($value, $precision)) === 0.0;
    }
}
