<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceItemFactory extends Factory
{
    protected $model = InvoiceItem::class;

    public function definition(): array
    {
        // =====================================================================
        // LANGKAH 1: Dapatkan Konteks dari Invoice Induk yang VALID
        // =====================================================================
        $invoice = $this->getValidInvoice();
        $project = $invoice->project; // Sekarang kita DIJAMIN punya proyek

        // =====================================================================
        // LANGKAH 2: Pilih Task yang Relevan dari Proyek yang Sama
        // =====================================================================
        $task = Task::where('project_id', $project->id)->inRandomOrder()->first();

        // Fallback: Jika proyek ini belum punya task, buat satu untuknya.
        if (!$task) {
            $task = Task::factory()->create(['project_id' => $project->id]);
        }

        $description = "Pekerjaan untuk: {$task->name}";

        // =====================================================================
        // LANGKAH 3: Tentukan Kuantitas dan Harga yang Logis
        // =====================================================================
        $quantity = $this->faker->numberBetween(1, 10);
        $unitPrice = $task->budget_task > 0
            ? $task->budget_task
            : $this->faker->numberBetween(100, 2000) * 100;

        $unitPrice = round($unitPrice);
        $totalPrice = $quantity * $unitPrice;

        return [
            'invoice_id' => $invoice->id,
            'task_id' => $task->id, // Selalu ada task ID sekarang
            'description' => $description,
            'quantity' => $quantity,
            'unit_price' => $unitPrice / 100,
            'total_price' => $totalPrice / 100,
        ];
    }

    /**
     * Helper untuk mendapatkan instance Invoice yang dijamin memiliki Project.
     */
    private function getValidInvoice(): Invoice
    {
        // Jika 'invoice_id' diberikan saat memanggil create(), gunakan itu untuk mencari Invoice.
        if (isset($this->states['invoice_id'])) {
            $invoice = Invoice::find($this->states['invoice_id']);
            // Pastikan invoice yang ditemukan punya project
            if ($invoice && $invoice->project_id) {
                return $invoice;
            }
        }

        // Cari invoice acak yang SUDAH PUNYA project_id.
        $invoice = Invoice::whereNotNull('project_id')->inRandomOrder()->first();

        // Jika tidak ada sama sekali, buat yang baru.
        // InvoiceFactory kita (yang sudah diperbaiki) akan menjamin ada project_id.
        if (!$invoice) {
            $invoice = Invoice::factory()->create();
        }

        return $invoice;
    }
}
