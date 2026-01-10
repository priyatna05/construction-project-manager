<?php

namespace App\Observers;

use App\Models\Attachment;
use Illuminate\Support\Facades\Storage;

class AttachmentObserver
{
    /**
     * Handle the Attachment "created" event.
     */
    public function created(Attachment $attachment): void
    {
        //
    }

    /**
     * Handle the Attachment "updated" event.
     */
    public function updated(Attachment $attachment): void
    {
        //
    }

    /**
     * Handle the Attachment "deleted" event.
     */
    public function deleted(Attachment $attachment): void
    {
        //
    }

    /**
     * Handle the Attachment "restored" event.
     */
    public function restored(Attachment $attachment): void
    {
        //
    }

    /**
     * Handle the Attachment "force deleted" event.
     */
    public function forceDeleted(Attachment $attachment): void
    {
        // Tambahan pengaman, jika file masih ada saat force delete
        if ($attachment->path && Storage::disk($attachment->disk ?? 'public')->exists($attachment->path)) {
            Storage::disk($attachment->disk ?? 'public')->delete($attachment->path);
        }

        if ($attachment->thumb && Storage::disk($attachment->disk ?? 'public')->exists($attachment->thumb)) {
            Storage::disk($attachment->disk ?? 'public')->delete($attachment->thumb);
        }
    }

    /**
     * Handle the Attachment "deleting" event.
     *
     * Event ini dipanggil sebelum attachment dihapus dari database.
     */
    public function deleting(Attachment $attachment): void
    {
        // Pastikan file utama dihapus
        if ($attachment->path && Storage::disk($attachment->disk ?? 'public')->exists($attachment->path)) {
            Storage::disk($attachment->disk ?? 'public')->delete($attachment->path);
        }

        // Jika ada thumbnail, hapus juga
        if ($attachment->thumb && Storage::disk($attachment->disk ?? 'public')->exists($attachment->thumb)) {
            Storage::disk($attachment->disk ?? 'public')->delete($attachment->thumb);
        }
    }

}
