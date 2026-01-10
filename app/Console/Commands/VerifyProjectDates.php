<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class VerifyProjectDates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'verify:project-dates {--id= : Optional existing project id to update}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update a project using YYYY-MM-DD payload and show how dates are stored in DB';

    public function handle()
    {
        $id = $this->option('id');

        // Example payload that the frontend sends (date-only strings)
        $payload = [
            'name' => 'Verify Date Project ' . now()->format('YmdHis'),
            'code' => 'VER-' . substr(sha1(now()), 0, 6),
            'start_date' => '2025-12-05',
            'end_date' => '2025-12-10',
        ];

        if ($id) {
            $project = Project::find($id);
            if (! $project) {
                $this->error("Project with id {$id} not found.");
                return 1;
            }

            $this->info("Updating project id={$id} with payload:");
            $this->line(json_encode($payload));
            $project->update($payload);
        } else {
            $this->info('Creating test project with payload:');
            $this->line(json_encode($payload));
            $project = Project::create($payload);
        }

        $this->info('Reloading from DB to show stored values:');
        $fresh = Project::find($project->id);

        // Display raw DB values for clarity
        $row = DB::table('projects')->where('id', $project->id)->first();

        $this->line('Eloquent model casts (formatted):');
        $this->line('start_date (model): ' . ($fresh->start_date ? $fresh->start_date->toDateString() : 'null'));
        $this->line('end_date   (model): ' . ($fresh->end_date ? $fresh->end_date->toDateString() : 'null'));

        $this->line('Raw DB row values:');
        $this->line('start_date (db): ' . ($row->start_date ?? 'null'));
        $this->line('end_date   (db): ' . ($row->end_date ?? 'null'));

        $this->info('Done. Use the --id option to update an existing project.');

        return 0;
    }
}
