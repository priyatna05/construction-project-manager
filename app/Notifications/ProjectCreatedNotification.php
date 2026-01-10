<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class ProjectCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Project $project;

    /**
     * Create a new notification instance.
     */
    public function __construct(Project $project)
    {
       $this->project = $project;
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
        return (new MailMessage)
            ->subject("New Project Assigned: {$this->project->name}")
            ->greeting("Hello {$notifiable->name},")
            ->line("You have been assigned to the project: {$this->project->name}")
            ->action('View Project', url(route('projects.index', $this->project->id)))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'project_id' => $this->project->id,
            'name'       => $this->project->name,
            'message'    => "You have been assigned to project: {$this->project->name}"
        ];
    }

    /**
     * Get the database representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase($notifiable)
    {
        return [
            'title' => 'New Project Assigned',
            'body' => "You have been assigned to project: {$this->project->name}",
            'description' => "You have been assigned to project: {$this->project->name}",
            'project_id' => $this->project->id,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     *
     */
    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'title' => 'New Project Assigned',
            'body' => "You have been assigned to project: {$this->project->name}",
            'description' => "You have been assigned to project: {$this->project->name}",
            'project_id' => $this->project->id,
        ]);
    }
}
