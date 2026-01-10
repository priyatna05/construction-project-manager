<?php

namespace App\Http\Controllers\Task;

use App\Actions\Task\CreateTask;
use App\Events\Task\AttachmentDeleted;
use App\Http\Controllers\Controller;
use App\Http\Resources\Attachments\AttachmentResource;
use App\Models\Attachment;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AttachmentController extends Controller
{
    public function store(Request $request, Project $project, Task $task): JsonResponse
    {
        $request->validate([
            'attachments' => 'required|array',
            'attachments.*' => 'required|file|max:10240', // 10MB max
        ]);

        $files = app(CreateTask::class)->uploadAttachments($task, $request->attachments);

        return response()->json(['files' => $files->map(fn($file) => new AttachmentResource($file))]);
    }

    public function destroy(Request $request, Project $project, Task $task, $workReportOrAttachment, Attachment $attachment = null): JsonResponse
    {
        try {
            // Handle both task attachments and work report attachments
            if ($attachment) {
                // This is for task attachments: /projects/{project}/tasks/{task}/attachments/{attachment}
                if ($attachment->task_id !== $task->id) {
                    return response()->json([
                        'message' => 'Attachment does not belong to this task'
                    ], 403);
                }
            } else {
                // This is for work report attachments: /projects/{project}/tasks/{task}/work-reports/{workReport}/attachments/{attachment}
                $attachment = $workReportOrAttachment;
                // Check if attachment belongs to a work report of this task
                $workReport = $task->workReports()->whereHas('attachments', function($query) use ($attachment) {
                    $query->where('id', $attachment->id);
                })->first();

                if (!$workReport) {
                    return response()->json([
                        'message' => 'Attachment does not belong to this task\'s work reports'
                    ], 403);
                }
            }

            File::delete(public_path($attachment->path));
            File::delete(public_path($attachment->thumb));
            $attachment->delete();

            AttachmentDeleted::dispatch($task, $attachment->id);

            return response()->json([
                'message' => 'Attachment deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete attachment.'
            ], 500);
        }
    }
}
