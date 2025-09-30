<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskGroup;
use App\Models\User;
use App\Models\Label;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 1. Dapatkan relasi yang logis: Task Group -> Project
        $taskGroup = TaskGroup::inRandomOrder()->first() ?? TaskGroup::factory()->create();
        $project = $taskGroup->project;

        // 2. Dapatkan anggota tim dari proyek yang relevan
        $team = $project->users;
        if ($team->isEmpty()) {
            // Fallback: Jika proyek tidak punya user, tambahkan beberapa
            $team = User::factory(3)->create();
            $project->users()->attach($team);
        }

        // 3. Tentukan rentang tanggal yang valid untuk task (harus di dalam Task Group)
        $groupStart = Carbon::parse($taskGroup->start_date);
        $groupEnd = Carbon::parse($taskGroup->end_date);

        $startDate = Carbon::instance($this->faker->dateTimeBetween($groupStart, $groupEnd));
        $maxEndDate = $groupEnd->min($startDate->copy()->addWeeks($this->faker->numberBetween(1, 4)));
        $endDate = Carbon::instance($this->faker->dateTimeBetween($startDate, $maxEndDate));

        // 4. Tentukan progress yang realistis berdasarkan tanggal
        $progress = 0;
        if ($endDate->isPast()) {
            $progress = 100; // Jika sudah lewat, 100% selesai
        } elseif ($startDate->isPast()) {
            $totalDuration = $endDate->diffInDays($startDate);
            $elapsedDuration = now()->diffInDays($startDate);
            $progress = $totalDuration > 0 ? min(100, round(($elapsedDuration / $totalDuration) * 100)) : 0;
        }

        // 5. Siapkan data finansial
        $budgetTask = $this->faker->numberBetween(500, 10000) * 100; // Dalam satuan terkecil
        $actualCost = $progress > 0
            ? $this->faker->numberBetween($budgetTask * ($progress / 100) * 0.8, $budgetTask * ($progress / 100) * 1.2)
            : 0;

        return [
            'project_id' => $project->id,
            'group_id' => $taskGroup->id,
            'created_by_user_id' => $team->random()->id,
            'assigned_to_user_id' => $this->faker->optional(0.9)->randomElement($team->pluck('id')),
            'assigned_at' => now(),
            'number' => null, // Biarkan seeder yang mengatur ini untuk keunikan per proyek
            'order_column' => 0, // Biarkan seeder yang mengatur ini untuk urutan per grup
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->realText(200),
            'start_date' => $startDate->toDateString(), // Format ke Y-m-d sesuai skema
            'end_date' => $endDate->toDateString(), // Format ke Y-m-d sesuai skema
            'budget_task' => $budgetTask / 100, // Simpan sebagai desimal
            'weight_task' => $this->faker->optional()->randomFloat(2, 1, 10),
            'progress_task' => $progress,
            'actual_cost' => $actualCost / 100, // Simpan sebagai desimal
            'archived_at' => null,
        ];
    }

    /**
     * Konfigurasi model setelah dibuat untuk menambahkan relasi.
     */
        /**
     * Konfigurasi model setelah dibuat untuk menambahkan relasi.
     */
    public function configure(): static
    {
        // Pastikan direktori storage ada (cukup sekali di atas)
        Storage::disk('public')->makeDirectory('attachments');

        return $this->afterCreating(function (Task $task) {

            $team = $task->project->users; // Ambil tim proyek sekali untuk digunakan di bawah

            // ==========================================================
            // 1. Tambahkan SUBSCRIBERS
            // ==========================================================
            if ($team->isNotEmpty()) {
                $subscribers = $team->random(min($team->count(), $this->faker->numberBetween(1, 3)))->pluck('id');
                $task->subscribedUsers()->sync($subscribers);
            }

            // ==========================================================
            // 2. Tambahkan LABELS (untuk status, dll.)
            // ==========================================================
            $taskLabels = Label::whereIn('type', ['pt_status', 'ptb_status'])->get();
            if ($taskLabels->isNotEmpty()) {
                $numberOfLabels = $this->faker->numberBetween(1, 2);
                $labelsToAttach = $taskLabels->random($numberOfLabels)->pluck('id');
                $task->labels()->sync($labelsToAttach);
            }

            // ==========================================================
            // 3. Tambahkan DEPENDENCIES (secara acak dan dinamis)
            // ==========================================================
            $relationTypeIds = Label::where('type', 'task_relation')->pluck('id');
            if ($this->faker->boolean(30) && $relationTypeIds->isNotEmpty()) {
                $potentialDependencies = Task::where('project_id', $task->project_id)
                    ->where('id', '!=', $task->id)->where('start_date', '<', $task->start_date)->get();

                if ($potentialDependencies->isNotEmpty()) {
                    $dependencyTask = $potentialDependencies->random();
                    $task->dependencies()->attach($dependencyTask->id, [
                        'relation_type_id' => $relationTypeIds->random(),
                        'lag_days' => $this->faker->numberBetween(0, 3)
                    ]);
                }
            }

            // ==========================================================
            // 4. Tambahkan ATTACHMENTS (secara acak)
            // ==========================================================
            if ($this->faker->boolean(40)) { // 40% kemungkinan task punya lampiran
                $numberOfAttachments = $this->faker->numberBetween(1, 3);
                $dummyFiles = [
                    database_path('factories/files/sample.pdf'),
                    database_path('factories/files/blueprint.jpg'),
                    database_path('factories/files/report.docx'),
                ];
                for ($i = 0; $i < $numberOfAttachments; $i++) {
                    $sourceFile = $this->faker->randomElement($dummyFiles);
                    if (!file_exists($sourceFile)) continue;
                    $fakeFile = new UploadedFile($sourceFile, basename($sourceFile), \mime_content_type($sourceFile), null, true);
                    $path = $fakeFile->store('attachments', 'public');
                    $task->attachments()->create([
                        'project_id' => $task->project_id,
                        'user_id' => $team->isNotEmpty() ? $team->random()->id : User::factory(),
                        'name' => $fakeFile->getClientOriginalName(), 'path' => $path,
                        'disk' => 'public', 'size' => $fakeFile->getSize(), 'mime_type' => $fakeFile->getMimeType(),
                    ]);
                }
            }

            // ==========================================================
            // 5. Tambahkan INVENTORY ALLOCATIONS (secara acak)
            // ==========================================================
            if ($this->faker->boolean(50)) { // 50% kemungkinan task punya alokasi inventory
                InventoryTaskAllocationFactory::new()
                    ->count($this->faker->numberBetween(1, 3))
                    ->create(['task_id' => $task->id]);
            }
        });
    }

    /**
     * State untuk task yang sudah selesai.
     */
    public function completed(): Factory
    {
        return $this->state(function (array $attributes) {
            $group = TaskGroup::find($attributes['group_id']);
            $endDate = Carbon::instance($this->faker->dateTimeBetween($group->start_date, $group->end_date))->subDay();
            $startDate = $endDate->copy()->subDays($this->faker->numberBetween(3, 14));
            return [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'progress_task' => 100,
            ];
        });
    }
}
