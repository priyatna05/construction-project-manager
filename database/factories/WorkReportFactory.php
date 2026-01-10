<?php

namespace Database\Factories;

use App\Models\WorkReport;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkReport>
 */
class WorkReportFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = WorkReport::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $task = Task::inRandomOrder()->first() ?? Task::factory()->create();
        $user = $task->project->users->random() ?? User::factory()->create();

        return [
            'task_id' => $task->id,
            'user_id' => $user->id,
            'project_id' => $task->project_id,
            'date' => $this->faker->date(),
            'hours' => $this->faker->numberBetween(1, 8),
            'description' => $this->faker->sentence(),
            'actual_cost' => $this->faker->randomFloat(2, 10, 500),
            'approved' => $this->faker->boolean(80), // 80% approved
        ];
    }
}
