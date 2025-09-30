<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ClientCompany;
use App\Models\User;
use App\Models\Label;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

   /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     * @var \DateTime $start_date
     */
    public function definition(): array
    {
        // --- 1. Tanggal yang Lebih Logis ---
        // Proyek bisa dimulai dari 6 bulan lalu hingga 1 bulan ke depan
        $startDate = Carbon::instance($this->faker->dateTimeBetween('-6 months', '+1 month'));
        // Durasi proyek antara 2 hingga 8 bulan
        $endDate = $startDate->copy()->addMonths($this->faker->numberBetween(2, 8));

        // --- 2. Progress yang Terhubung dengan Tanggal ---
        $progress = 0;
        if ($startDate->isFuture()) {
            // Jika proyek belum dimulai, progress 0%
            $progress = 0;
        } elseif ($endDate->isPast()) {
            // Jika proyek sudah selesai, progress 100%
            $progress = 100;
        } else {
            // Jika proyek sedang berjalan, hitung persentase waktu yang telah berlalu
            $totalDuration = $endDate->diffInDays($startDate);
            $elapsedDuration = now()->diffInDays($startDate);
            $progress = $totalDuration > 0 ? min(100, round(($elapsedDuration / $totalDuration) * 100)) : 0;
        }

        // --- 3. Relasi ke ClientCompany yang Sudah Ada ---
        // Ambil ID perusahaan yang sudah ada. Jika tidak ada, baru buat yang baru.
        $clientIds = ClientCompany::pluck('id');
        $clientId = $clientIds->isNotEmpty() ? $this->faker->randomElement($clientIds) : ClientCompany::factory();

        return [
            'client_company_id' => $clientId,
            'code' => null, // Biarkan observer yang men-generate
            'name' => $this->generateRealisticProjectName(), // Panggil fungsi helper untuk nama
            'description' => $this->faker->realText(400), // Teks yang lebih realistis
            'start_date' => $startDate,
            'end_date' => $endDate,
            // --- 4. Budget yang Lebih Realistis (dalam satuan terkecil, misal: sen/rupiah) ---
            // Menghasilkan angka bulat antara 50,000,000 sampai 2,000,000,000
            'budget_project' =>  $this->faker->numberBetween(500, 20000) * 100000,
            'progress_project' => $progress,
            'archived_at' => null,
        ];
    }

    /**
     * Helper function untuk membuat nama proyek yang lebih realistis.
     */
    private function generateRealisticProjectName(): string
    {
        $types = ['Pembangunan', 'Renovasi', 'Desain Interior', 'Pemasangan Sistem', 'Pengembangan'];
        $objects = ['Gedung Perkantoran', 'Rumah Mewah', 'Apartemen', 'Jembatan Layang', 'Taman Kota', 'Sistem Irigasi', 'Aplikasi Web'];
        $locations = ['Jakarta Selatan', 'Bandung City Center', 'Surabaya Timur', 'Kawasan Industri Cikarang', 'Denpasar'];

        return $this->faker->randomElement($types) . ' ' . $this->faker->randomElement($objects) . ' di ' . $this->faker->randomElement($locations);
    }

    // --- 5. Mendefinisikan Status Proyek yang Berbeda ---

    /**
     * State untuk proyek yang sudah selesai.
     */
    public function completed(): Factory
    {
        return $this->state(function (array $attributes) {
           $endDate = Carbon::instance($this->faker->dateTimeBetween('-1 year', '-1 month'));
            $startDate = $endDate->copy()->subMonths($this->faker->numberBetween(3, 9));
            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'progress_project' => 100,
            ];
        });
    }

    /**
     * State untuk proyek yang sedang berjalan.
     */
    public function inProgress(): Factory
    {
        return $this->state(function (array $attributes) {
            $startDate = Carbon::instance($this->faker->dateTimeBetween('-3 months', '-1 week'));
            $endDate = $startDate->copy()->addMonths($this->faker->numberBetween(4, 8));
            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ];
        });
    }

    /**
     * State untuk proyek yang diarsipkan.
     */
    public function archived(): Factory
    {
        return $this->state(fn (array $attributes) => [
            'archived_at' => now(),
        ]);
    }

    /**
     * Konfigurasi untuk menambahkan users ke proyek setelah dibuat.
     */
   public function configure(): static
    {
         // Pastikan direktori storage untuk lampiran sudah ada
        Storage::disk('public')->makeDirectory('attachments');

        return $this->afterCreating(function (Project $project) {

            // --- Bagian untuk Menambahkan Users (tetap ada) ---
            $userIds = User::inRandomOrder()->limit($this->faker->numberBetween(1, 5))->pluck('id');
            $project->users()->sync($userIds);

            // --- BAGIAN BARU: Menambahkan Labels ke Project ---
            // 1. Ambil semua label yang relevan untuk proyek.
            $projectLabels = Label::whereIn('type', ['pt_status', 'ptb_status'])->get();

            if ($projectLabels->isNotEmpty()) {
                // 2. Tentukan berapa banyak label yang akan dilampirkan (misal: 1 atau 2).
                $numberOfLabels = $this->faker->numberBetween(1, 2);

                // 3. Ambil label secara acak dan lampirkan ke proyek.
                $labelsToAttach = $projectLabels->random($numberOfLabels)->pluck('id');
                $project->labels()->sync($labelsToAttach);
            }

            // --- Bagian Baru untuk Menambahkan Attachments ---
            $numberOfAttachments = $this->faker->numberBetween(0, 4);// Setiap proyek akan punya 0 sampai 4 lampiran

            if ($numberOfAttachments > 0) {
                // Daftar file dummy yang kita siapkan
                $dummyFiles = [
                    database_path('factories/files/sample.pdf'),
                    database_path('factories/files/blueprint.jpg'),
                    database_path('factories/files/report.docx'),
                ];

                for ($i = 0; $i < $numberOfAttachments; $i++) {
                    // Pilih file dummy secara acak
                    $sourceFile = $this->faker->randomElement($dummyFiles);

                    // Jika file tidak ada, lewati iterasi ini
                    if (!file_exists($sourceFile)) {
                        continue;
                    }

                    // Buat file palsu untuk di-upload
                    $fakeFile = new UploadedFile(
                        $sourceFile,
                        basename($sourceFile), // Dapatkan nama file asli
                        \mime_content_type($sourceFile),
                        null,
                        true // true menandakan ini adalah file tes, jadi tidak akan dipindahkan
                    );

                    // Simpan file ke storage
                    $path = $fakeFile->store('attachments', 'public');

                    // Buat record di database menggunakan relasi
                    $project->attachments()->create([
                        'user_id' => $project->users->isNotEmpty() ? $project->users->random()->id : User::factory(),
                        'name' => $fakeFile->getClientOriginalName(),
                        'path' => $path,
                        'disk' => 'public',
                        'size' => $fakeFile->getSize(),
                        'mime_type' => $fakeFile->getMimeType(),
                    ]);
                }
            }
        });
    }
    }
