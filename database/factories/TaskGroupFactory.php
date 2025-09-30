<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\TaskGroup;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class TaskGroupFactory extends Factory
{
    protected $model = TaskGroup::class;

    public function definition(): array
    {
        // Pilih proyek secara acak, atau buat yang baru jika tidak ada
        $project = Project::inRandomOrder()->first() ?? Project::factory()->create();

        // Logika tanggal yang lebih aman, dengan fallback jika tanggal proyek null
        $projectStart = $project->start_date ? Carbon::parse($project->start_date) : now()->subMonth();
        $projectEnd = $project->end_date ? Carbon::parse($project->end_date) : now()->addMonths(6);

        // Pastikan start date tidak setelah end date (kasus data tidak valid)
        if ($projectStart->gt($projectEnd)) {
            $projectStart = $projectEnd->copy()->subMonth();
        }

        $startDate = $this->faker->dateTimeBetween($projectStart, $projectEnd);

        // Batas akhir: 1-4 minggu setelah mulai, tapi tidak boleh melebihi tanggal akhir proyek
        $maxEndDate = Carbon::parse($startDate)->addWeeks($this->faker->numberBetween(1, 4))->min($projectEnd);

        $endDate = $this->faker->dateTimeBetween($startDate, $maxEndDate);

        return [
            'project_id'       => $project->id,
            'name'             => $this->faker->sentence(3),
            'description'      => $this->faker->optional()->sentence,
            'start_date'       => $startDate,
            'end_date'         => $endDate,
            'budget_group'     => $this->faker->optional()->numberBetween(1000, 50000) * 100, // Dalam satuan terkecil
            'weight_group'     => $this->faker->optional()->randomFloat(2, 5, 25),
            'progress_group'   => $this->faker->randomFloat(2, 0, 100),
            'order_column'     => 0, // Akan diatur oleh seeder
            'archived_at'      => null,
        ];
    }
}
