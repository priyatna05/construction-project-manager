<?php

namespace App\Events\Task;

use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    private Task $task;

    public int $taskId;

    public string $property;

    public mixed $value;


    /**
     * Create a new event instance.
     */
    public function __construct(
        Task $task,
        string $updateField,
    ) {
        $this->task = $task->fresh();

        $this->taskId = $task->id;
        $this->property = $updateField;

        if ($updateField === 'assigned_to_user') {
            $this->task->loadMissing(['assignedToUser:id,name,avatar']);
            $this->value = $this->task->assignedToUser
                ? $this->task->assignedToUser->only(['id', 'name', 'avatar'])
                : null;
        } else {
            $this->value = $this->task->toArray()[$updateField] ?? null;
        }

        $this->dontBroadcastToCurrentUser();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.Project.{$this->task->project_id}"),
        ];
    }
}
