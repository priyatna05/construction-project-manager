<?php

namespace App\Notifications;

use App\Enums\Queue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Cache;

class OtpResendNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        $this->onQueue(Queue::EMAIL->value);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $otp = $this->generateOtpCode($notifiable);

        return (new MailMessage)
            ->subject('Kode OTP Baru - '.config('app.name'))
            ->greeting("Hello {$notifiable->getFirstName()},")
            ->line('Berikut adalah kode OTP baru untuk aktivasi akun Anda.')
            ->line("Kode OTP: **{$otp}**")
            ->line('Silakan masukkan kode OTP ini di halaman verifikasi.')
            ->line('Kode OTP berlaku selama 24 jam.')
            ->salutation('Best regards, '.config('app.name').' Team');
    }

    private function generateOtpCode($user): string
    {
        $otp = str_pad(\random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put('otp_user_' . $user->id, $otp, now()->addHours(24));
        return $otp;
    }
}
