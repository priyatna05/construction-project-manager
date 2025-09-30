<?php

namespace App\Events\Analytic;

use App\Models\EvmRecord;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class EvmRecordUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public EvmRecord $evmRecord;

    /**
     * Create a new event instance.
     *
     * @param EvmRecord $evmRecord
     */
    public function __construct(EvmRecord $evmRecord)
    {
        $this->evmRecord = $evmRecord;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel|array
     */
    public function broadcastOn()
    {
        // Broadcast on the private project channel
        return new PrivateChannel('App.Models.Project.' . $this->evmRecord->project_id);
    }

    /**
     * Data to broadcast with the event.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'evmRecord' => $this->evmRecord->toArray(),
        ];
    }

    /**
     * Event name for broadcasting.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'EvmRecordUpdated';
    }
}
