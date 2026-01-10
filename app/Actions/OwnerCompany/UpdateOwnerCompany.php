<?php

namespace App\Actions\OwnerCompany;

use App\Models\OwnerCompany;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class UpdateOwnerCompany
{
    /**
     * Update owner company data including logo.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    public function update($request): bool
    {
        // Ambil record pertama (asumsi hanya 1 company)
        $ownerCompany = OwnerCompany::first();

        if (!$ownerCompany) {
            // Log::error('Owner company not found');
            throw new \Exception('Owner company not found');
        }

        // Ambil semua data kecuali logo
        $data = $request->except(['logo']);

        // Handle file logo jika ada
        if ($request->file('logo') instanceof UploadedFile) {
            $file = $request->file('logo');

            // Buat nama file unik
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $cleanName = Str::slug($originalName);
            $extension = $file->getClientOriginalExtension();
            $filename = $cleanName . '-' . uniqid() . '.' . $extension;

            // Simpan file ke storage/app/public/company
            $folder = 'company';
            $stored = Storage::disk('public')->putFileAs($folder, $file, $filename);

            if ($stored) {
                // Simpan path publik ke database
                $data['logo'] = '/storage/' . $folder . '/' . $filename;

                // Log::info('Logo uploaded successfully', [
                //     'disk_path' => $folder . '/' . $filename,
                //     'public_path' => $data['logo']
                // ]);
            } else {
                // Log::error('Failed to store logo file', [
                //     'filename' => $filename,
                //     'folder' => $folder
                // ]);
                throw new \Exception('Failed to store logo file');
            }
        } else {
            // Log::info('No logo file in request');
        }

        // Update data company
        $result = $ownerCompany->update($data);

        // Log::info('Update result', ['result' => $result, 'data' => $data]);

        return $result;
    }
}
