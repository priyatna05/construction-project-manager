<?php

namespace Database\Seeders;

use App\Models\Label;
use App\Models\Project;
use App\Models\TaskGroup;
use App\Models\User;
use Illuminate\Database\Seeder;

class TasksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = Project::with(['taskGroups'])->get();
        $admin = User::role('admin')->first();

        foreach ($projects as $project) {
            $number = 1;

            $project->taskGroups->each(function (TaskGroup $taskGroup, int $key) use ($project, $admin, &$number) {
                for ($i = 0; $i < random_int(0, 8); $i++) {
                    $task = $taskGroup->tasks()->create([
                        'project_id' => $project->id,
                        'created_by_user_id' => $admin->id,
                        'assigned_to_user_id' => $admin->id,
                        'name' => fake()->sentence,
                        'number' => $number++,
                        'description' => fake()->sentences(4, true),
                        'start_date' => fake()->dateTimeBetween('-1 month', '+1 month'),
                        'end_date' => fake()->dateTimeBetween('+1 month', '+2 month'),
                        'budget_task' => fake()->randomFloat(2, 0, 1000),
                        'hidden_from_clients' => false,
                        'billable' => true,
                        'completed_at' => fake()->randomElement([now(), null, null, null]),
                    ]);

                    Label::inRandomOrder()
                        ->limit(random_int(0, 3))
                        ->get()
                        ->each(function (Label $label) use ($task) {
                            $task->labels()->attach($label);
                        });
                }
            });
        }
    }
}
