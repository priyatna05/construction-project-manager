<?php

namespace Database\Seeders;

use App\Models\ClientCompany;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // -----------------------------------------------------------------
        // LANGKAH 1: Pastikan Data Prasyarat (Dependencies) Sudah Ada
        // -----------------------------------------------------------------

        // Cek apakah ada User. Jika tidak, buat 20 user baru
        // dan berikan mereka role secara acak.
        // Catatan: Pastikan RoleSeeder sudah dijalankan sebelumnya.
        if (User::count() === 0) {
            User::factory(20)->create()->each(function($user) {
                // Pastikan roles 'admin', 'manager', 'team member' ada di database Anda
                $user->assignRole(fake()->randomElement(['admin', 'manager', 'team member']));
            });
        }

        // Cek apakah ada ClientCompany. Jika tidak, buat 10.
        if (ClientCompany::count() === 0) {
            ClientCompany::factory(10)->create();
        }


        // -----------------------------------------------------------------
        // LANGKAH 2: Buat Proyek dengan Berbagai Status
        // Factory akan menangani semuanya secara otomatis:
        // - Memilih ClientCompany secara acak
        // - Menambahkan Users ke proyek secara acak
        // - Membuat lampiran file secara acak
        // -----------------------------------------------------------------

        // Buat 15 proyek yang sedang berjalan.
        Project::factory(15)->inProgress()->create();

        // Buat 8 proyek yang sudah selesai.
        Project::factory(8)->completed()->create();

        // Buat 3 proyek yang sudah diarsipkan.
        Project::factory(3)->archived()->create();


        // -----------------------------------------------------------------
        // LANGKAH 3: Buat Proyek Demo Spesifik (Opsional)
        // -----------------------------------------------------------------

        // Gunakan ->state() untuk menimpa nilai default dari factory.
        // Factory akan tetap menjalankan hook `configure()` untuk menambahkan
        // user dan lampiran secara otomatis.
        Project::factory()
            ->state([
                'name' => 'Flagship Construction EVM Demo',
                'description' => 'Proyek demonstrasi untuk menunjukkan fitur-fitur utama platform, termasuk EVM, manajemen tugas, dan kolaborasi tim.',
                'budget_project_estimate' => 50000000, // Budget dalam rupiah
                'client_company_id' => ClientCompany::first()?->id, // Pilih perusahaan pertama, atau NULL jika tidak ada
                'progress_project' => 65,
                'start_date' => now()->subMonths(2),
                'end_date' => now()->addMonths(4),
            ])
            ->create();
    }
}
