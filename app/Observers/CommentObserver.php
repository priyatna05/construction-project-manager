<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentObserver
{
    /**
     * Handle the Comment "created" event.
     */
    public function created(Comment $comment): void
    {
        $user = Auth::user() ?? User::whereHas('roles', fn($q) =>
            $q->where('name', 'admin')
        )->first();

        $userId = $user?->id ?? 1;
        $userName = $user?->name ?? 'System';

        $comment->activities()->create([
            'project_id' => $comment->task->project_id,
            'user_id' => $userId,
            'title' => 'New comment',
            'description' => $userName. " left a comment on \"{$comment->task->name}\" task",
        ]);
    }}
