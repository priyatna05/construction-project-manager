<?php

namespace App\Actions\ClientCompany;

use App\Models\ClientCompany;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UpdateClientCompany
{
    public function update(ClientCompany $clientCompany, array $data): ClientCompany
    {
        return DB::transaction(function () use ($clientCompany, $data) {
            $data = $this->handleLogoUpdate($clientCompany, $data);
            $clientCompany->update($data);

            if (! empty($data['clients'])) {
                $clientCompany->clients()->sync($data['clients']);
            }

            return $clientCompany;
        });
    }

    private function handleLogoUpdate(ClientCompany $clientCompany, array $data): array
    {
        if (! array_key_exists('logo', $data)) {
            return $data;
        }

        if ($data['logo'] instanceof UploadedFile) {
            $this->deleteLogoFile($clientCompany->logo);
            $data['logo'] = $this->storeLogo($data['logo']);
            return $data;
        }

        if ($data['logo'] === null) {
            $this->deleteLogoFile($clientCompany->logo);
            $data['logo'] = null;
            return $data;
        }

        unset($data['logo']);

        return $data;
    }

    private function storeLogo(UploadedFile $file): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $cleanName = Str::slug($originalName);
        $extension = $file->getClientOriginalExtension();
        $filename = $cleanName . '-' . uniqid() . '.' . $extension;

        $folder = 'client-companies';
        $stored = Storage::disk('public')->putFileAs($folder, $file, $filename);

        if (! $stored) {
            throw new \Exception('Failed to store logo file');
        }

        return '/storage/' . $folder . '/' . $filename;
    }

    private function deleteLogoFile(?string $logoPath): void
    {
        if (! $logoPath) {
            return;
        }

        $relativePath = ltrim(str_replace('/storage/', '', $logoPath), '/');

        if ($relativePath !== '') {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
