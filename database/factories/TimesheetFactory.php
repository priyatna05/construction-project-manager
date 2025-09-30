<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\Task;
use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class TimesheetFactory extends Factory
{
    protected $model = Timesheet::class;

    public function definition(): array
    {
        // =====================================================================
        // LANGKAH 1: Tentukan Konteks (Task -> Project -> Team)
        // =====================================================================
        // Mulai dari Task untuk mendapatkan konteks yang benar.
        $task = Task::inRandomOrder()->first();
        if (!$task) {
            $task = Task::factory()->create(); // Jika tidak ada task sama sekali, buat satu.
        }
        $project = $task->project;
        $team = $project->users; // Ambil anggota tim dari proyek ini.

        // Pilih pengguna dari tim proyek. Jika tim kosong, buat pengguna baru dan tambahkan ke tim.
        if ($team->isEmpty()) {
            $user = User::factory()->create();
            $project->users()->attach($user);
        } else {
            $user = $team->random();
        }

        // =====================================================================
        // LANGKAH 2: Tentukan Tanggal, Jam, dan Biaya
        // =====================================================================
        $taskStart = Carbon::parse($task->start_date);
        $taskEnd = Carbon::parse($task->end_date);

        // Tanggal entri timesheet harus berada dalam rentang pelaksanaan task.
        $entryDate = $this->faker->dateTimeBetween($taskStart, $taskEnd);

        $hoursWorked = $this->faker->randomFloat(2, 1, 8);

        // Prioritaskan rate default user, jika tidak ada, gunakan rate acak.
        $hourlyRate = $user->default_hourly_rate ?? $this->faker->randomFloat(2, 15, 75);

        // =====================================================================
        // LANGKAH 3: Tentukan Status dan Logika Approval
        // =====================================================================
        $status = $this->faker->randomElement(['Pending', 'Approved', 'Rejected']);
        $approved_at = null;
        $approved_by_user_id = null;

        if ($status !== 'Pending') {
            // Cari manajer/admin di dalam tim proyek ini.
            $approver = $project->users()->whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'manager']))->inRandomOrder()->first();

            // Jika tidak ada manajer di proyek, cari manajer mana pun secara global.
            if (!$approver) {
                $approver = User::role(['admin', 'manager'])->inRandomOrder()->first() ?? User::factory()->create()->assignRole('manager');
            }

            $approved_by_user_id = $approver->id;
            $approved_at = $this->faker->dateTimeBetween($entryDate, $taskEnd);
        }

        return [
            'user_id' => $user->id,
            'task_id' => $task->id,
            'project_id' => $project->id, // Selalu konsisten dengan project dari task
            'entry_date' => $entryDate,
            'hours_worked' => $hoursWorked,
            'hourly_rate' => $hourlyRate,
            // 'cost' akan dihitung oleh model event/mutator, jadi kita tidak set di sini.
            'description' => $this->faker->optional(0.6)->sentence,
            'status' => $status,
            'approved_by_user_id' => $approved_by_user_id,
            'approved_at' => $approved_at,
        ];
    }
}
