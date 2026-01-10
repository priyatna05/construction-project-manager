<?php

namespace App\Actions\Task;

use App\Models\Task;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use App\Actions\Attachment\StoreAttachmentAction;
use App\Events\Task\AttachmentsUploaded;

class CreateTask
{
    public function __construct(
        protected StoreAttachmentAction $storeAttachmentAction
    ) {}

    /**
     * Upload attachments ke task.
     */
    public function uploadAttachments(Task $task, array $items, bool $dispatchEvent = true): Collection
    {
        $attachments = collect($items)->map(function (UploadedFile $file) use ($task) {
            // Gunakan StoreAttachmentAction untuk proses upload & thumbnail
            $this->storeAttachmentAction->execute($task, $file);

            // Ambil record terakhir (attachment baru saja dibuat)
            return $task->attachments()->latest('id')->first();
        });

        // Buat activity log
        if ($attachments->isNotEmpty()) {
            $task->activities()->create([
                'project_id'  => $task->project_id,
                'user_id'     => Auth::id(),
                'title'       => ($attachments->count() > 1 ? 'Attachments were' : 'Attachment was') . ' uploaded',
                'description' => 'to "' . $task->name . '" by ' . Auth::user()->name,
            ]);
        }

        // Dispatch event (WebSocket, real-time update, dsb)
        if ($dispatchEvent) {
            AttachmentsUploaded::dispatch($task, $attachments);
        }

        return $attachments;
    }
}
