<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Project $project)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Project Completed: {$this->project->name}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Congratulations! The project \"{$this->project->name}\" has been completed.")
            ->line("Project Code: {$this->project->code}")
            ->action('View Project', url(route('projects.tasks', $this->project->id)))
            ->line('Thank you for partnering with us.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'project_id' => $this->project->id,
            'name' => $this->project->name,
            'code' => $this->project->code,
            'message' => "Project {$this->project->code} - {$this->project->name} has been marked completed.",
        ];
    }

    public function toDatabase($notifiable): DatabaseMessage
    {
        return new DatabaseMessage($this->toArray($notifiable) + [
            'title' => "Project {$this->project->code} Completed",
            'body' => "{$this->project->name} has been marked completed.",
            'description' => "Project {$this->project->code} - {$this->project->name} has been successfully completed.",
            'project_id' => $this->project->id,
            'link' => route('projects.tasks', $this->project->id),
        ]);
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable) + [
            'title' => "Project {$this->project->code} Completed",
            'body' => "{$this->project->name} has been marked completed.",
            'description' => "Project {$this->project->code} - {$this->project->name} has been successfully completed.",
            'project_id' => $this->project->id,
            'link' => route('projects.tasks', $this->project->id),
        ]);
    }
}
