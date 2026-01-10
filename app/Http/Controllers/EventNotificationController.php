<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\EventsNotify;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class EventNotificationController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'date' => ['nullable', 'date'],
            'time' => ['nullable', 'string', 'max:50'],
            'notifyUsers' => ['array'],
            'notifyUsers.*' => ['integer', Rule::exists('users', 'id')],
        ]);

        $eventData = [
            'title' => $data['title'],
            'type' => $data['type'] ?? 'event',
            'description' => $data['description'] ?? null,
            'date' => $data['date'] ?? null,
            'time' => $data['time'] ?? null,
            'created_by' => Auth::user()?->name,
        ];

        $recipients = User::whereIn('id', $data['notifyUsers'] ?? [])->get();
        $sent = 0;
        $failed = 0;

        foreach ($recipients as $recipient) {
            try {
                $recipient->notify(new EventsNotify($eventData));
                $sent++;
            } catch (\Throwable $e) {
                $failed++;
                Log::error('Failed to send event notification', [
                    'recipient_id' => $recipient->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'sent' => $sent,
            'failed' => $failed,
            'message' => 'Event notifications dispatched',
        ]);
    }
}
