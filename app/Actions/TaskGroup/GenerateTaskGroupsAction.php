<?php

namespace App\Actions\TaskGroup;

use App\Models\Project;

class GenerateTaskGroupsAction
{
    private const TEMPLATES = [
        'wbs' => [
            ['name' => 'Pekerjaan Persiapan'], ['name' => 'Pekerjaan Tanah'],
            ['name' => 'Pekerjaan Dinding dan Lantai'], ['name' => 'Pekerjaan Atap'],
            ['name' => 'Pekerjaan Plafon'], ['name' => 'Pekerjaan Pengecatan'],
            ['name' => 'Pekerjaan Sanitari'], ['name' => 'Pekerjaan Listrik'],
            ['name' => 'Pekerjaan Taman'],
        ],
        'scrum' => [
            ['name' => 'Product Backlog'], ['name' => 'Sprint Planning'],
            ['name' => 'Daily Scrum'], ['name' => 'Sprint Review'],
            ['name' => 'Sprint Retrospective'], ['name' => 'Done'],
        ],
        'status' => [
            ['name' => 'Planning'], ['name' => 'To Do'], ['name' => 'In Progress'],
            ['name' => 'Quality Control'], ['name' => 'Done'],
        ],
    ];

    public function execute(Project $project, ?string $templateType): void
    {
        if (is_null($templateType) || !array_key_exists($templateType, self::TEMPLATES)) {
            return;
        }

        $project->taskGroups()->createMany(self::TEMPLATES[$templateType]);
    }
}
