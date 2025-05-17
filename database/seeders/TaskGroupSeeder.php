<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class TaskGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = Project::all();

        foreach ($projects as $project) {
            $project->taskGroups()->createMany([
                ['name_group' => 'Pekerjaan Persiapan'],
                ['name_group' => 'Pekerjaan Tanah'],
                ['name_group' => 'Pekerjaan Dinding dan Lantai'],
                ['name_group' => 'Pekerjaan Atap'],
                ['name_group' => 'Pekerjaan Plafon'],
                ['name_group' => 'Pekerjaan Pengecatan'],
                ['name_group' => 'Pekerjaan Sanitari'],
                ['name_group' => 'Pekerjaan Listrik'],
                ['name_group' => 'Pekerjaan Taman'],
            ]);
        }
    }
}
