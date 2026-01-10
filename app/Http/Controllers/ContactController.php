<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ContactRequestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'requestType' => 'required|in:account,project,both,consultation',
            'projectType' => 'nullable|in:residential,commercial,industrial,infrastructure,renovation,custom',
            'budget' => 'nullable|in:10-50,50-100,100-500,500+,discuss',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        if (!auth()->check()) {
            $email = Str::lower(trim((string) $request->input('email', '')));
            $phone = preg_replace('/\D+/', '', (string) $request->input('phone', ''));
            $phoneKey = $phone !== '' ? $phone : 'no-phone';
            $dateKey = now()->format('Y-m-d');
            $cacheKey = 'contact:limit:' . sha1("{$email}|{$phoneKey}|{$dateKey}");
            $limit = 4;

            $currentCount = (int) Cache::get($cacheKey, 0);
            if ($currentCount >= $limit) {
                return back()->error(
                    'Request limit reached',
                    'Maximum 4 requests per day for this email and phone number.'
                );
            }

            $expiresAt = now()->endOfDay();
            if (!Cache::add($cacheKey, 1, $expiresAt)) {
                Cache::increment($cacheKey);
                Cache::put($cacheKey, (int) Cache::get($cacheKey, 1), $expiresAt);
            }
        }

        // Get administrators and project managers
        $adminsAndManagers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'manager']);
        })->get();

        // Send notification to each admin and manager
        foreach ($adminsAndManagers as $user) {
            $user->notify(new ContactRequestNotification($request->all()));
        }

        return back()->with('success', 'Contact request sent successfully. We will contact you within 24 hours.');
    }
}
