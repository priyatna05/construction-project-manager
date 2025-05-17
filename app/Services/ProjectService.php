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
