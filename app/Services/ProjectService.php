<?php

namespace App\Services;

use App\Models\Project;

class ProjectService
{
    public function __construct(public Project $project) {}

    /**
     * Membuat proyek baru & menambahkan task group default.
     */
    public function createProject(array $data): Project
    {
        $project = Project::create($data);
        $project->users()->attach($data['users']);

        // Tambahkan default task groups
        $project->taskGroups()->createMany([
            ['name' => 'Backlog'],
            ['name' => 'Todo'],
            ['name' => 'In progress'],
            ['name' => 'QA'],
            ['name' => 'Done'],
            ['name' => 'Deployed'],
        ]);

        return $project;
    }

    /**
     * Mengupdate proyek yang sudah ada.
     */
    public function updateProject(array $data): void
    {
        $this->project->update($data);
        $this->project->users()->sync($data['users']);
    }

    /**
     * Update akses pengguna untuk proyek.
     */
    public function updateUserAccess(array $userIds): void
    {
        $this->project->users()->sync($userIds);
    }
}
