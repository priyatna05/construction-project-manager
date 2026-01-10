<?php

namespace App\Actions\ClientCompany;

use App\Models\ClientCompany;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CreateClientCompany
{
    public function create(array $data): ClientCompany
    {
        return DB::transaction(function () use ($data) {
            $data = $this->handleLogoUpload($data);
            $clientCompany = ClientCompany::create($data);

            if (! empty($data['clients'])) {
                $clientCompany->clients()->attach($data['clients']);
            }

            return $clientCompany;
        });
    }

    private function handleLogoUpload(array $data): array
    {
        if (! array_key_exists('logo', $data)) {
            return $data;
        }

        if ($data['logo'] instanceof UploadedFile) {
            $data['logo'] = $this->storeLogo($data['logo']);
        } elseif ($data['logo'] !== null) {
            unset($data['logo']);
        }

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
}
