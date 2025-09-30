<?php

namespace Database\Factories;

use App\Models\Inventory;
use App\Models\InventoryTaskAllocation;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class InventoryTaskAllocationFactory extends Factory
{
    protected $model = InventoryTaskAllocation::class;

    public function definition(): array
    {
        // =====================================================================
        // LANGKAH 1: Tentukan Konteks (Task -> Project)
        // =====================================================================
        // Mulai dari Task. Ini akan menjadi jangkar untuk relasi lainnya.
        $task = Task::inRandomOrder()->first();
        if (!$task) {
            // Jika sama sekali tidak ada task, buat satu dengan factory-nya yang sudah cerdas
            $task = Task::factory()->create();
        }
        $project = $task->project; // Dapatkan proyek dari task tersebut.

        // =====================================================================
        // LANGKAH 2: Cari Inventory yang Relevan dengan Proyek yang Sama
        // =====================================================================
        // Cari inventory yang terhubung ke proyek yang sama dengan task.
        $inventory = Inventory::where('project_site_location_id', $project->id)
                              ->where('quantity_on_hand', '>', 0) // Hanya alokasikan yang stoknya ada
                              ->inRandomOrder()
                              ->first();

        if (!$inventory) {
            // Jika tidak ada inventory yang cocok di proyek itu, buat satu yang baru untuk proyek tersebut.
            $inventory = Inventory::factory()->create(['project_site_location_id' => $project->id]);
        }

        // =====================================================================
        // LANGKAH 3: Hitung Kuantitas dan Biaya yang Logis
        // =====================================================================
        // Alokasikan antara 10% hingga 50% dari stok yang tersedia, tapi tidak lebih dari 100 unit.
        $maxAllocation = min(100, $inventory->quantity_on_hand);
        $quantityAllocated = $this->faker->randomFloat(
            2,
            $maxAllocation * 0.1, // Minimal 10% dari stok
            $maxAllocation * 0.5  // Maksimal 50% dari stok
        );

        // Biaya dihitung berdasarkan unit_cost inventory pada saat alokasi.
        // Asumsi unit_cost adalah desimal, jika integer, hapus pembagian / 100.
        $costAtAllocation = $quantityAllocated * ($inventory->unit_cost);

        // =====================================================================
        // LANGKAH 4: Tentukan Tanggal dan Pengguna yang Relevan
        // =====================================================================
        $taskStart = Carbon::parse($task->start_date);
        $taskEnd = Carbon::parse($task->end_date);

        // Tanggal alokasi harus berada dalam rentang pelaksanaan task.
        $allocationDate = $this->faker->dateTimeBetween($taskStart, $taskEnd);

        // Pengguna yang mengalokasikan harus bagian dari tim proyek.
        $allocatingUser = $project->users->isNotEmpty() ? $project->users->random() : User::factory()->create();

        return [
            'inventory_id' => $inventory->id,
            'task_id' => $task->id,
            'allocated_by_user_id' => $allocatingUser->id,
            'quantity_allocated' => $quantityAllocated,
            'cost_at_allocation' => $costAtAllocation,
            'allocation_date' => $allocationDate,
            'notes' => $this->faker->optional(0.3)->sentence, // 30% kemungkinan ada catatan
        ];
    }
}
