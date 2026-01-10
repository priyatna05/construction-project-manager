<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ContactRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public array $contactData;

    /**
     * Create a new notification instance.
     */
    public function __construct(array $contactData)
    {
        $this->contactData = $contactData;
    }

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
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = 'New Contact Request: ' . ucfirst($this->contactData['requestType']);

        $mail = (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name},")
            ->line("You have received a new contact request from {$this->contactData['name']}.")
            ->line("**Contact Details:**")
            ->line("Name: {$this->contactData['name']}")
            ->line("Email: {$this->contactData['email']}")
            ->line("Phone: " . ($this->contactData['phone'] ?? 'Not provided'))
            ->line("Company: " . ($this->contactData['company'] ?? 'Not provided'))
            ->line("Request Type: " . ucfirst($this->contactData['requestType']));

        if (isset($this->contactData['projectType'])) {
            $mail->line("Project Type: " . ucfirst($this->contactData['projectType']));
        }

        if (isset($this->contactData['budget'])) {
            $budgetLabels = [
                '10-50' => '< 50 Jt',
                '50-100' => '50-100 Jt',
                '100-500' => '100-500 Jt',
                '500+' => '> 500 Jt',
                'discuss' => 'To be discussed'
            ];
            $mail->line("Budget: " . ($budgetLabels[$this->contactData['budget']] ?? $this->contactData['budget']));
        }

        $mail->line("**Message:**")
            ->line($this->contactData['message'])
            ->action('View Dashboard', url(route('dashboard')))
            ->line('Please respond to this request within 24 hours.');

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
            'contact_name' => $this->contactData['name'],
            'contact_email' => $this->contactData['email'],
            'request_type' => $this->contactData['requestType'],
            'message' => "New contact request from {$this->contactData['name']} ({$this->contactData['email']})"
        ];
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'New Contact Request',
            'body' => "Contact request from {$this->contactData['name']} - " . ucfirst($this->contactData['requestType']) . ". Message: {$this->contactData['message']}",
            'description' => "Contact request from {$this->contactData['name']} - " . ucfirst($this->contactData['requestType']) . ". Message: {$this->contactData['message']}",
            'contact_data' => $this->contactData,
            'link' => route('notifications'),
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'New Contact Request',
            'body' => "Contact request from {$this->contactData['name']} - " . ucfirst($this->contactData['requestType']) . ". Message: {$this->contactData['message']}",
            'contact_data' => $this->contactData,
            'link' => route('notifications'),
        ]);
    }
}
