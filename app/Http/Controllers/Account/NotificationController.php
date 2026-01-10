<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\Notification\NotificationGroupedByDateCollection;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{

    public function index(): Response
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user) {
            return Inertia::render('Auth/Login');
        }

        return Inertia::render('Account/Notifications/Index', [
            'groups' => new NotificationGroupedByDateCollection(
                $user->notifications()->latest()->get()
            ),
        ]);
    }

    public function read(DatabaseNotification $notification)
    {
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function readAll()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function destroy(DatabaseNotification $notification)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($notification->notifiable_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $notification->delete();

        session()->flash('success', 'Notification deleted successfully');

        return response()->json(['message' => 'Notification deleted']);
    }

    public function clearAll()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->notifications()->delete();

        return response()->json(['message' => 'All notifications cleared']);
    }
}
