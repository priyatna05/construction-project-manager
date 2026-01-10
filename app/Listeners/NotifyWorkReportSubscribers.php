<?php

namespace App\Listeners;

use App\Events\Task\WorkReportCreated;
use App\Models\User;
use App\Notifications\WorkReportCreatedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class NotifyWorkReportSubscribers implements ShouldQueue
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
     */
    public function handle(WorkReportCreated $event): void
    {
        $workReport = $event->workReport;

        // Get project managers and admins
        $projectManagers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'manager']);
        })->get();

        // Notify project managers and admins
        $projectManagers->each(function (User $user) use ($workReport) {
            $user->notify(new WorkReportCreatedNotification($workReport));
        });
    }
}
