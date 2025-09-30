<?php

namespace App\Observers;

use App\Models\Timesheet;

class TimeSheetObserver
{
   public function saving(Timesheet $timesheet)
    {
        if ($timesheet->isDirty('hours_worked') || $timesheet->isDirty('hourly_rate')) {
            if (is_numeric($timesheet->hours_worked) && is_numeric($timesheet->hourly_rate)) {
                $timesheet->cost = round($timesheet->hours_worked * $timesheet->hourly_rate, 2);
            } elseif (is_numeric($timesheet->hours_worked) && !isset($timesheet->hourly_rate) && $timesheet->user) {
                $defaultRate = $timesheet->user->default_hourly_rate ?? 0;
                if ($defaultRate > 0) {
                    $timesheet->hourly_rate = $defaultRate;
                    $timesheet->cost = round($timesheet->hours_worked * $defaultRate, 2);
                } else {
                    $timesheet->cost = 0;
                }
            }
        }
    }
}
