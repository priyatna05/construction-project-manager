<?php

namespace App\Events\Task;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InventoryUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $taskId;
    public array $inventories;

    /**
     * Create a new event instance.
     */
    public function __construct(int $taskId, array $inventories)
    {
        $this->taskId = $taskId;
        $this->inventories = $inventories;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $task = \App\Models\Task::find($this->taskId);
        return [
            new PrivateChannel("App.Models.Project.{$task->project_id}"),
        ];
    }
}
