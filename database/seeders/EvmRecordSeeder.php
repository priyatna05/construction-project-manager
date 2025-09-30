<?php

namespace Database\Seeders;

use App\Models\EvmRecord;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class EvmRecordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $projects = Project::whereNotNull('start_date')->get();

        if ($projects->isEmpty()) {
            $this->command->warn('No projects with start dates found. Cannot seed EVM records.');
            return;
        }

        foreach ($projects as $project) {
            // Kita akan membuat record EVM mingguan dari awal proyek hingga hari ini
            $startDate = Carbon::parse($project->start_date);
            $cursorDate = $startDate->copy();
            $today = now();

            // Jangan buat record untuk proyek yang belum dimulai
            if ($startDate->isFuture()) {
                continue;
            }

            while ($cursorDate->lessThanOrEqualTo($today)) {
                // Buat satu record EVM untuk tanggal ini menggunakan state kustom
                EvmRecord::factory()
                    ->withCalculationsFor($project, $cursorDate->copy())
                    ->create();

                // Maju ke minggu berikutnya untuk iterasi selanjutnya
                $cursorDate->addWeek();
            }
        }

        $this->command->info('EVM records have been created for active projects.');
    }
}
