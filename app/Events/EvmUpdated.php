<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event untuk broadcast update EVM secara real-time.
 * Frontend dapat listen event ini untuk update UI tanpa refresh.
 */
class EvmUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $projectId;
    public $metrics;

    /**
     * Constructor event.
     */
    public function __construct($projectId, $metrics)
    {
        $this->projectId = $projectId;
        $this->metrics = $metrics;
    }

    /**
     * Channel untuk broadcast event ini.
     * Menggunakan private channel per project.
     */
    public function broadcastOn()
    {
        return new PrivateChannel("project.{$this->projectId}");
    }

    /**
     * Nama event untuk frontend.
     */
    public function broadcastAs()
    {
        return 'evm.updated';
    }

    /**
     * Data yang akan di-broadcast.
     */
    public function broadcastWith()
    {
        return [
            'project_id' => $this->projectId,
            'metrics' => $this->metrics,
        ];
    }
}
