<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateWorkReportNotificationType extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:update-work-report-type';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update work report notifications to include type => work_report_approval in data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting update of work report notifications...');

        // Get all notifications where data contains 'work_report_id'
        $notifications = DB::table('notifications')
            ->where('data', 'like', '%"work_report_id"%')
            ->get();

        $updatedCount = 0;

        foreach ($notifications as $notification) {
            $data = json_decode($notification->data, true);

            // Check if 'type' is missing or not 'work_report_approval'
            if (!isset($data['type']) || $data['type'] !== 'work_report_approval') {
                $data['type'] = 'work_report_approval';

                DB::table('notifications')
                    ->where('id', $notification->id)
                    ->update(['data' => json_encode($data)]);

                $updatedCount++;
            }
        }

        $this->info("Updated {$updatedCount} notifications.");
        $this->info('Update completed.');
    }
}
