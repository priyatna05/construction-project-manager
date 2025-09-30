<?php

namespace App\Observers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ProjectObserver
{
    /**
     * Cache untuk menyimpan counter terakhir untuk setiap prefix dalam satu kali run.
     * @var array
     */
    private static array $counters = [];

    /**
     * Handle the Project "creating" event.
     */
    public function creating(Project $project): void
    {
        if (empty($project->code)) {
            $prefix = $project->clientCompany?->getCodePrefix() ?? 'PRJ';

            // Langkah 1: Inisialisasi counter untuk prefix ini jika belum ada.
            // Query ke database hanya akan terjadi SATU KALI per prefix per request.
            if (!isset(self::$counters[$prefix])) {
                // Ambil proyek terakhir dengan prefix yang sama untuk mendapatkan nomor terakhirnya.
                $lastProject = Project::where('code', 'like', "{$prefix}-%")
                                      ->orderBy('code', 'desc') // Urutkan berdasarkan kode untuk mendapatkan yang terbesar
                                      ->first();

                // Jika sudah ada, ambil nomornya. Jika tidak, mulai dari 0.
                self::$counters[$prefix] = $lastProject
                    ? (int) substr($lastProject->code, -5)
                    : 0;
            }

            // Langkah 2: Naikkan counter yang sudah ada di memori.
            self::$counters[$prefix]++;

            // Langkah 3: Buat kode baru menggunakan counter dari memori.
            $sequence = str_pad(self::$counters[$prefix], 5, '0', STR_PAD_LEFT);
            $project->code = "{$prefix}-{$sequence}";
        }
    }

    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        // (Logika 'created' Anda sudah bagus dan tidak perlu diubah)
        $user = Auth::user() ?? User::role('admin')->first(); // Sedikit penyederhanaan
        $userId   = $user?->id   ?? 1;
        $userName = $user?->name ?? 'System';

        $project->activities()->create([
            'project_id' => $project->id,
            'user_id'    => $userId,
            'title'      => 'New project',
            'description'   => "\"{$project->name}\" was created by {$userName}",
        ]);
    }
}
