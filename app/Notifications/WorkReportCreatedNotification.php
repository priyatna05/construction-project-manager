<?php

namespace App\Notifications;

use App\Enums\Queue;
use App\Models\WorkReport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WorkReportCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public WorkReport $workReport) {}

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
     * Determine the notification's delivery delay.
     *
     * @return array<string, \Illuminate\Support\Carbon>
     */
    public function withDelay(object $notifiable): array
    {
        return [
            'mail' => now()->addMinutes(5),
        ];
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
     * Determine if the notification should be sent.
     */
    public function shouldSend(object $notifiable, string $channel): bool
    {
        if ($channel === 'mail') {
            return !$notifiable
                ->unreadNotifications()
                ->whereJsonContains('data->work_report_id', $this->workReport->id)
                ->exists();
        }

        return true;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("[{$this->workReport->task->project->name}] Work report submitted for")
            ->greeting("{$this->workReport->user->name} submitted a work report for")
            ->action('Review work report', route('projects.tasks.open', ['project' => $this->workReport->task->project_id, 'task' => $this->workReport->task->id]))
            ->line("Task: {$this->workReport->task->name}")
            ->line("Progress: {$this->workReport->progress}%")
            ->line("Work done: {$this->workReport->work_done} " . ($this->workReport->unitLabel ? $this->workReport->unitLabel->name : ''));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'work_report_id' => $this->workReport->id,
            'task_id'        => $this->workReport->task_id,
            'type'           => 'work_report_approval',
            'title'          => "{$this->workReport->user->name} submitted a work report for",
            'description'    => "On task \"{$this->workReport->task->name}\" in \"{$this->workReport->task->project->name}\" project",
            'link'           => route('projects.tasks.open', [$this->workReport->task->project_id, $this->workReport->task->id, 'tab' => 'work_reports', 'work_report_id' => $this->workReport->id]),
            'created_at'     => $this->workReport->created_at,
            'read_at'        => null,
        ];
    }
}
