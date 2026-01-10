<?php

namespace App\Notifications;

use App\Enums\Queue;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventsNotify extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public array $eventData = []) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Determine which queues should be used for each notification channel.
     *
     * @return array<string, string>
     */
    public function viaQueues(): array
    {
        return [
          'mail' => Queue::EMAIL->value,
        ];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $title = $this->eventData['title'] ?? 'New event';
        $type = $this->eventData['type'] ?? null;
        $date = $this->eventData['date'] ?? null;
        $time = $this->eventData['time'] ?? null;
        $creator = $this->eventData['created_by'] ?? null;
        $agenda = trim(strip_tags($this->eventData['description'] ?? ''));
        $formattedDate = $date ? Carbon::parse($date)->format('l, d M Y') : null;
        $formattedTime = $time ?: null;
        $parts = [];
        if ($formattedDate) {
            $parts[] = $formattedDate;
        }
        if ($formattedTime) {
            $parts[] = $formattedTime;
        }
        $eventLabel = implode(' · ', $parts);
        $typeLabel = $type ? ucfirst($type) : 'Event';

        $mail = (new MailMessage)
            ->subject("Invitation: {$title}")
            ->greeting("Hello {$notifiable->name},")
            ->line(($creator ? "{$creator} invites you to" : 'You are invited to') . " a {$typeLabel}: \"{$title}\"")
            ->line($eventLabel ? "Schedule: {$eventLabel}" : 'Schedule: To be announced')
            ->line('Agenda:')
            ->line($agenda !== '' ? $agenda : '-')
            ->action('View event', route('dashboard', ['tab' => 'events']))
            ->line('This invitation was sent automatically. If you were not expecting it, you can safely ignore it.');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title'       => $this->eventData['title'] ?? 'New event created',
            'type'        => $this->eventData['type'] ?? null,
            'description' => $this->eventData['description'] ?? null,
            'date'        => $this->eventData['date'] ?? null,
            'time'        => $this->eventData['time'] ?? null,
            'created_by'  => $this->eventData['created_by'] ?? null,
            'link'        => route('dashboard', ['tab' => 'events']),
        ];
    }

    /**
     * Broadcast payload for realtime in-app notifications.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
