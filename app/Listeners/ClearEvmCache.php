<?php

namespace App\Listeners;

use App\Events\Project\ProjectUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;

class ClearEvmCache implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * Hapus cache EVM untuk proyek yang diperbarui dan dispatch job untuk recalculate.
     */
    public function handle(ProjectUpdated $event): void
    {
        $project = $event->project;
        $periods = ['day', 'week', 'month'];

        foreach ($periods as $period) {
            // Gunakan cache key yang konsisten (v2)
            Cache::forget("evm_{$project->id}_{$period}_v2");
        }

        // Dispatch job untuk recalculate EVM setelah cache dihapus
        \App\Jobs\RecalculateEvmJob::dispatch($project);
    }
}
