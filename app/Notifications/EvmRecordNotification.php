<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EvmRecordNotification extends Notification
{
    public function __construct(
        public Project $project,
        public array $metrics,
        public array $triggers,
        public ?int $evmRecordId = null,
        public array $status = [],
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $lines = collect($this->triggers)->map(function ($trigger) {
            return match ($trigger['type']) {
                'cv_negative' => sprintf('Cost Variance is negative: %.2f (Cost overrun)', $trigger['value']),
                'sv_negative' => sprintf('Schedule Variance is negative: %.2f (Delayed)', $trigger['value']),
                'cpi_below_one' => sprintf('CPI below 1: %.2f (Over budget)', $trigger['value']),
                'spi_below_one' => sprintf('SPI below 1: %.2f (Behind schedule)', $trigger['value']),
                'cpi' => sprintf('CPI dropped below threshold: %.2f (threshold %.2f)', $trigger['value'], $trigger['threshold'] ?? 0),
                'spi' => sprintf('SPI dropped below threshold: %.2f (threshold %.2f)', $trigger['value'], $trigger['threshold'] ?? 0),
                'eac_over_bac' => sprintf('EAC (%.2f) exceeds BAC (%.2f)', $trigger['value'], $trigger['bac']),
                default => 'EVM attention required',
            };
        });

        $notesLines = [];
        if (!empty($this->status['notes'])) {
            $notesLines = explode("\n", $this->status['notes']);
        }

        $riskStatus = ($this->status['at_risk'] ?? true) ? 'Attention required' : 'On track';

        return (new MailMessage)
            ->subject('[EVM Alert] ' . $this->project->name)
            ->greeting('Hi,')
            ->line('EVM indicators require your attention for project: ' . $this->project->name)
            ->line('Risk status: ' . $riskStatus)
            ->lines($lines->all())
            ->line('Summary:')
            ->line('CPI: ' . ($this->metrics['cpi'] ?? 'n/a'))
            ->line('SPI: ' . ($this->metrics['spi'] ?? 'n/a'))
            ->line('CV: ' . ($this->metrics['cv'] ?? 'n/a'))
            ->line('SV: ' . ($this->metrics['sv'] ?? 'n/a'))
            ->line('EAC: ' . ($this->metrics['eac'] ?? 'n/a'))
            ->line('BAC: ' . ($this->metrics['bac'] ?? 'n/a'))
            ->line('Details:')
            ->lines($notesLines)
            ->action('View Project', route('projects.tasks', $this->project->id));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'evm_alert',
            'project_id' => $this->project->id,
            'project_name' => $this->project->name,
            'evm_record_id' => $this->evmRecordId,
            'metrics' => $this->metrics,
            'triggers' => $this->triggers,
            'title' => '[EVM] ' . $this->project->name,
            'description' => $this->status['summary'] ?? 'EVM attention required on this project.',
            'notes' => $this->status['notes'] ?? null,
            'at_risk' => $this->status['at_risk'] ?? true,
            'link' => route('projects.tasks', $this->project->id),
        ];
    }
}
