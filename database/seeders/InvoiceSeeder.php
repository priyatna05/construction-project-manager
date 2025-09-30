<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Database\Seeder;

class InvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Pastikan ada proyek untuk dibuatkan invoice.
        $projects = Project::all();
        if ($projects->isEmpty()) {
            $this->command->warn('No projects found. Please run ProjectSeeder first.');
            return;
        }

        // Iterasi melalui setiap proyek yang ada.
        foreach ($projects as $project) {

            // 50% kemungkinan sebuah proyek akan memiliki invoice.
            if (fake()->boolean(50)) {

                // Buat 1 sampai 3 invoice untuk proyek ini.
                Invoice::factory(fake()->numberBetween(1, 3))
                    ->create([
                        // Kita hanya perlu memberikan konteks spesifik (ID proyek & klien).
                        // Factory akan menangani sisanya.
                        'project_id' => $project->id,
                        'client_company_id' => $project->client_company_id,
                    ]);

                // TIDAK PERLU ->each() LAGI!
                // Method configure() di InvoiceFactory akan secara otomatis:
                // 1. Membuat InvoiceItem untuk setiap invoice.
                // 2. Menghitung ulang subtotal, tax, dan total.
                // 3. Mengatur tanggal paid_at atau due_date jika perlu.
                // 4. Menyimpan semua perubahan.
            }
        }

        $this->command->info('Invoices with items have been created for various projects.');
    }
}
