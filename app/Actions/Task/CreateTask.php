<?php

namespace App\Actions\Task;

use Throwable;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Support\Str;
use App\Events\Task\TaskCreated;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\ImageManagerStatic as Image;
use Illuminate\Support\Facades\Storage;
use App\Events\Task\AttachmentsUploaded;

class CreateTask
{
    public function create(Project $project, array $data): Task
    {
        return DB::transaction(function () use ($project, $data) {
            $task = $project->tasks()->create([
                'group_id'              => $data['group_id'],
                'created_by_user_id'    => Auth::id(),
                'assigned_to_user_id'   => $data['assigned_to_user_id'],
                'name'             => $data['name'],
                'number'                => $project->tasks()->withArchived()->count() + 1,
                'description'      => $data['description'],
                'start_date'       => $data['start_date'],
                'end_date'         => $data['end_date'],
                'budget_task'           => $data['budget_task'],
            ]);

            $task->moveToStart();

            $task->subscribedUsers()->attach($data['subscribed_users'] ?? []);

            $task->labels()->attach($data['labels'] ?? []);

            if (! empty($data['attachments'])) {
                $this->uploadAttachments($task, $data['attachments'], false);
            }

            TaskCreated::dispatch($task);

            return $task;
        });
    }

    public function uploadAttachments(Task $task, array $items, $dispatchEvent = true): Collection
    {
        $rows = collect($items)
            ->map(function (UploadedFile $item) use ($task) {
                $filename = strtolower(Str::uuid()).'.'.$item->getClientOriginalExtension();
                $filepath = "tasks/{$task->id}/{$filename}";

                $item->storeAs('public', $filepath);

                $thumbFilepath = $this->generateThumb($item, $task, $filename);

                return [
                    'user_id' => Auth::id(),
                    'name' => $item->getClientOriginalName(),
                    'path' => "/storage/$filepath",
                    'thumb' => $thumbFilepath ? "/storage/$thumbFilepath" : null,
                    'type' => $item->getClientMimeType(),
                    'size' => $item->getSize(),
                ];
            });

        $attachments = $task->attachments()->createMany($rows);

        $task->activities()->create([
            'project_id' => $task->project_id,
            'user_id' => Auth::id(),
            'title' => ($attachments->count() > 1 ? 'Attachments where' : 'Attachment was').' uploaded',
            'description' => "to \"{$task->name}\" by ".Auth::user()->name,
        ]);

        if ($dispatchEvent) {
            AttachmentsUploaded::dispatch($task, $attachments);
        }

        return $attachments;
    }

    protected function generateThumb(UploadedFile $file, Task $task, string $filename)
    {
        if (in_array($file->getClientOriginalExtension(), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'])) {
            try {
                $thumbFilepath = "tasks/{$task->id}/thumbs/{$filename}";
                /** @var \Intervention\Image\ImageManagerStatic $image */
                $image = Image::make($file->get())
                    ->fit(100, 100)
                    ->encode(null, 75);

                Storage::put("public/{$thumbFilepath}", $image);

                return $thumbFilepath;
            } catch (Throwable $e) {
                Log::error("Thumbnail generation failed: " . $e->getMessage());
                return null;
            }
        }

        return null;
    }

}
