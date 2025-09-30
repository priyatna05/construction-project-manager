<?php

namespace App\Http\Controllers\Task;

use App\Actions\Task\CreateTask;
use App\Events\Task\AttachmentDeleted;
use App\Http\Controllers\Controller;
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
        $files = (new CreateTask)->uploadAttachments($task, $request->attachments);

        return response()->json(['files' => $files]);
    }

    public function destroy(Request $request, Project $project, Task $task, Attachment $attachment)
    {
           logger([
            'user_id' => Auth::id(),
            'input_password' => $request->password,
            'stored_password' => Auth::user()?->password,
        ]);

        if (!Auth::check() || !Hash::check($request->password, Auth::user()->password)) {
            return redirect()->back()->with([
                'title' => 'Error',
                'message' => 'Failed to verify password'
            ]);
        }

        File::delete(public_path($attachment->path));
        File::delete(public_path($attachment->thumb));
        $attachment->delete();

        AttachmentDeleted::dispatch($task, $attachment->id);

        return redirect()->back()->success('attachment deleted', 'Attachment deleted successfully.');
    }
}
