<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VerifyOtpController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/VerifyOtp');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = Auth::user();
        $cachedOtp = Cache::get('otp_user_' . $user->id);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return back()->withErrors(['otp' => 'Kode OTP tidak valid atau telah kedaluwarsa.']);
        }

        // Mark email as verified
        $user->email_verified_at = now();
        $user->save();

        // Remove OTP from cache
        Cache::forget('otp_user_' . $user->id);

        return redirect('/dashboard')->with('success', 'Akun Anda telah berhasil diverifikasi.');
    }

    public function resend(Request $request)
    {
        $user = Auth::user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        $user->sendEmailVerificationNotification();

        return back()->with('status', 'Kode OTP telah dikirim ulang ke email Anda.');
    }
}
