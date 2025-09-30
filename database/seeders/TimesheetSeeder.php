<?php

namespace Database\Seeders;

use App\Models\Timesheet;
use App\Models\Task;
use Illuminate\Database\Seeder;

class TimesheetSeeder extends Seeder
{
    public function run(): void
    {
        $tasks = Task::all();
        if ($tasks->isEmpty()) {
            $this->command->warn('No tasks found. Please run TaskSeeder first.');
            return;
        }

        $this->command->info('Creating timesheets for tasks...');

        // Buat total 500 entri timesheet, yang tersebar di semua task yang ada
        Timesheet::factory(500)->create();
    }
}
