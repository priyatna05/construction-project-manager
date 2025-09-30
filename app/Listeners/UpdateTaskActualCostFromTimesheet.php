<?php

namespace App\Listeners;

use App\Events\TimeSheet\TimesheetApproved;
use App\Models\Task;
use Illuminate\Contracts\Queue\ShouldQueue; // Opsional: jika prosesnya bisa berat
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateTaskActualCostFromTimesheet // implements ShouldQueue // Opsional
{
    public function handle(TimesheetApproved $event): void
    {
        $timesheet = $event->timesheet;
        $task = $timesheet->task;

        if (!$task) {
            Log::warning("Task not found for timesheet ID: {$timesheet->id}. Cannot update actual_cost.");
            return;
        }

        // Menggunakan transaksi untuk memastikan konsistensi
        DB::transaction(function () use ($task) {
            // Hitung ulang total biaya dari semua timesheet yang sudah disetujui untuk tugas ini
            // Ini lebih aman daripada increment untuk mencegah duplikasi jika event terpicu lebih dari sekali
            // atau jika ada perubahan status timesheet dari Approved ke status lain lalu kembali ke Approved.
            $totalApprovedCostForTask = $task->timesheets()
                                            ->where('status', 'Approved')
                                            ->sum('cost');

            // Jika ada sumber biaya lain (material, expense), tambahkan di sini
            // $totalMaterialCost = $task->inventoryAllocations()->sum('cost_at_allocation');
            // $totalExpenseCost = $task->expenses()->where('status', 'Approved')->sum('amount');
            // $task->actual_cost = $totalApprovedCostForTask + $totalMaterialCost + $totalExpenseCost;

            $task->actual_cost = $totalApprovedCostForTask; // Untuk saat ini hanya dari timesheet
            $task->saveQuietly(); // saveQuietly agar tidak memicu event lain dari model Task jika ada

            Log::info("Actual cost updated for task ID: {$task->id} to {$task->actual_cost} based on timesheet ID: {$timesheet->id}");
        });
    }
}
