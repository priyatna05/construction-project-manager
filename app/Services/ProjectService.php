<?php

namespace App\Services;

use App\Actions\TaskGroup\GenerateTaskGroupsAction;
use App\Actions\Attachment\StoreAttachmentAction;
use App\Models\Project;
use Illuminate\Http\UploadedFile;

class ProjectService
{
    public function create(array $validatedData, array $files = []): Project
    {
        // 1. Siapkan data proyek dasar
        $validatedData['budget_project'] *= 100;

        // 2. Buat proyek
        $project = Project::create($validatedData);

        // 3. Lampirkan user
        $project->users()->attach($validatedData['users']);

        foreach ($project->users as $user) {
            $user->notify(new \App\Notifications\ProjectCreatedNotification($project));
        }

        foreach ($project->clientCompany->clients as $client) {
            $client->notify(new \App\Notifications\ProjectCreatedNotification($project));
        }

        if ($project->client_company && $project->client_company->user) {
            $project->client_company->user->notify(new \App\Notifications\ProjectCreatedNotification($project));
        }

        // 4. Proses lampiran menggunakan Action
        foreach ($files as $file) {
            (new StoreAttachmentAction())->execute($project, $file);
        }

        // 5. Generate task group menggunakan Action
        (new GenerateTaskGroupsAction())->execute($project, $validatedData['generate_task_groups'] ?? null);

        return $project;
    }

    public function update(Project $project, array $validatedData, array $files = []): Project
    {
        // 1. Update data proyek dasar
        if (isset($validatedData['budget_project'])) {
            $validatedData['budget_project'] *= 100;
        }
        $project->update($validatedData);

        // 2. Sinkronkan user
        if (isset($validatedData['users'])) {
            $project->users()->sync($validatedData['users']);
        }

        // 3. Proses lampiran baru
        foreach ($files as $file) {
            (new StoreAttachmentAction())->execute($project, $file);
        }

        // Biasanya kita tidak men-generate task group saat update, tapi bisa ditambahkan jika perlu

        return $project;
    }

    public function updateUserAccess(Project $project, array $userIds): void
    {
        $project->users()->sync($userIds);
    }
}
