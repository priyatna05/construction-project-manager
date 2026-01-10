<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\TaskGroup;
use Illuminate\Database\Seeder;

class TaskGroupSeeder extends Seeder
{
    /**
     * Kumpulan template nama Task Group, diambil dari logika controller.
     * @var array
     */
    private $templates = [
        'wbs' => [
            'Pekerjaan Persiapan', 'Pekerjaan Tanah', 'Pekerjaan Struktur', 'Pekerjaan Atap',
            'Pekerjaan Dinding dan Lantai', 'Pekerjaan Plafon', 'Pekerjaan Pengecatan',
            'Pekerjaan Sanitari', 'Pekerjaan Listrik', 'Pekerjaan Taman',
        ],
        'scrum' => [
            'Product Backlog', 'Sprint Planning', 'Daily Scrum',
            'Sprint Review', 'Sprint Retrospective', 'Done',
        ],
        'status' => [
            'Planning', 'To Do', 'In Progress', 'Quality Control', 'Done',
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = Project::all();

        if ($projects->isEmpty()) {
            $this->command->warn('No projects found. Please run ProjectSeeder first.');
            return;
        }

        // Iterasi melalui setiap proyek yang ada di database
        foreach ($projects as $project) {
            // Pilih salah satu template secara acak untuk proyek ini
            $templateType = array_rand($this->templates);
            $groupsToCreate = $this->templates[$templateType];

            // Iterasi melalui nama-nama di template yang terpilih
            foreach ($groupsToCreate as $index => $groupName) {
                // Gunakan factory untuk membuat setiap task group
                // Nilai yang kita berikan di sini akan menimpa nilai default dari factory
                TaskGroup::factory()->create([
                    'project_id' => $project->id,
                    'name' => $groupName,
                    'order_column' => $index + 1, // Atur urutan berdasarkan posisi di template
                ]);
            }
        }
    }
}
