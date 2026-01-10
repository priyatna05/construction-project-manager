<?php

namespace App\Observers;

use App\Models\WorkReport;
use App\Jobs\RecalculateEvmJob;

class WorkReportObserver
{
    /**
     * Handle the WorkReport "created" event.
     * Trigger recalculation EVM ketika work report baru dibuat.
     */
    public function created(WorkReport $workReport): void
    {
        $this->recalculateEvm($workReport);
    }

    /**
     * Handle the WorkReport "updated" event.
     * Trigger recalculation EVM ketika work report diupdate.
     */
    public function updated(WorkReport $workReport): void
    {
        $this->recalculateEvm($workReport);
    }

    /**
     * Handle the WorkReport "deleted" event.
     * Trigger recalculation EVM ketika work report dihapus.
     */
    public function deleted(WorkReport $workReport): void
    {
        $this->recalculateEvm($workReport);
    }

    /**
     * Helper method untuk trigger recalculation EVM.
     */
    private function recalculateEvm(WorkReport $workReport): void
    {
        if ($workReport->task && $workReport->task->project) {
            // Dispatch job untuk kalkulasi async
            RecalculateEvmJob::dispatch($workReport->task->project);
        }
    }
}
