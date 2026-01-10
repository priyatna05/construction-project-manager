<?php

namespace App\Actions\Attachment;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;
use Illuminate\Support\Str;

class StoreAttachmentAction
{
    public function execute(Model $model, UploadedFile $file): void
    {
        $originalName = $file->getClientOriginalName();
        $cleanedName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();
        $uniqueFileName = $cleanedName . '-' . uniqid() . '.' . $extension;

        $folder = "attachments/{$this->getFolderName($model)}";
        $originalPath = $file->storeAs($folder, $uniqueFileName, 'public');

        $thumbnailPath = null;

        if (Str::startsWith($file->getMimeType(), 'image/')) {
            $thumbnailPath = $this->createThumbnail($originalPath);
        }
        $fileType = $this->determineFileType($file);

        $model->attachments()->create([
            'user_id'   => Auth::id(),
            'name'      => $originalName,
            'path'      => $originalPath,
            'thumb'     => $thumbnailPath,
            'disk'      => 'public',
            'size'      => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'file_type' => $fileType,
        ]);
    }

    private function createThumbnail(string $path): string
    {
        $thumbnailFilename = 'thumb-' . basename($path);
        $thumbnailPath = dirname($path) . '/' . $thumbnailFilename;

        $manager = new ImageManager(new GdDriver());

        $image = $manager->read(Storage::disk('public')->get($path))
            ->resize(150, null, fn($constraint) => $constraint->aspectRatio())
            ->toJpeg();
        Storage::disk('public')->put($thumbnailPath, (string) $image);

        return $thumbnailPath;
    }

    private function getFolderName(Model $model): string
    {
        $modelName = class_basename($model);

        if ($modelName === 'Project') {
            return "projects/{$model->id}";
        }

        if ($modelName === 'Task') {
            $project = $model->project;
            if ($project) {
                return "projects/{$project->id}/tasks/{$model->id}";
            }
            return "tasks/{$model->id}";
        }

        if ($modelName === 'WorkReport') {
            $task = $model->task;
            $project = $task?->project;
            if ($project && $task) {
                return "projects/{$project->id}/tasks/{$task->id}/workreports";
            }
            return "workreports";
        }

        // Default fallback untuk model lain
        return Str::lower(Str::plural($modelName));
    }


    private function determineFileType(UploadedFile $file): string
    {
        $mimeType = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());

        // Prioritaskan berdasarkan mime type
        if (str_contains($mimeType, 'image')) {
            return 'image';
        }

        if (str_contains($mimeType, 'pdf')) {
            return 'pdf';
        }
        if (str_contains($mimeType, 'word') || in_array($extension, ['doc', 'docx'])) {
            return 'word';
        }
        if (str_contains($mimeType, 'excel') || in_array($extension, ['xls', 'xlsx'])) {
            return 'excel';
        }
        if (str_contains($mimeType, 'csv') || $extension === 'csv') {
            return 'csv';
        }
        if (str_contains($mimeType, 'zip') || in_array($extension, ['zip', 'rar'])) {
            return 'archive';
        }
        if (str_contains($mimeType, 'text') || in_array($extension, ['txt', 'md'])) {
            return 'text';
        }
        if (in_array($extension, ['js', 'ts', 'jsx', 'tsx', 'php', 'html', 'css', 'vue'])) {
            return 'code';
        }
        return 'other';
    }
}
