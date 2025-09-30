<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskGroup;
use Illuminate\Database\Seeder;

class TasksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Ambil semua Task Group yang ada. Seeder ini berasumsi
        // ProjectSeeder dan TaskGroupSeeder sudah dijalankan.
        $taskGroups = TaskGroup::with('project')->get();

        if ($taskGroups->isEmpty()) {
            $this->command->warn('No Task Groups found. Please run ProjectSeeder and TaskGroupSeeder first.');
            return;
        }

        // Iterasi melalui setiap Task Group
        foreach ($taskGroups as $group) {
            // Untuk setiap grup, buat 5 sampai 10 task
            $numberOfTasks = fake()->numberBetween(5, 10);

            for ($i = 1; $i <= $numberOfTasks; $i++) {
                // Panggil factory untuk membuat satu task.
                // Factory akan menangani SEMUANYA:
                // - Memilih user yang relevan
                // - Menentukan tanggal & progress
                // - Menambahkan subscribers
                // - Menambahkan attachments
                // - Menambahkan labels
                // - Membuat dependencies
                // - Membuat inventory allocations

                Task::factory()->create([
                    // Seeder HANYA bertanggung jawab untuk data yang bergantung pada konteks loop:
                    'project_id' => $group->project_id,
                    'group_id' => $group->id,
                    'number' => ($group->project->tasks()->max('number') ?? 0) + 1, // Nomor unik per proyek
                    'order_column' => $i, // Urutan di dalam grup
                ]);
            }
        }
    }
}
