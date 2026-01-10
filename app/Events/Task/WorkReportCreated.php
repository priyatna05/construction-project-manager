<?php

namespace App\Events\Task;

use App\Models\WorkReport;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkReportCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $taskId;
    public WorkReport $workReport;

    /**
     * Create a new event instance.
     */
    public function __construct(WorkReport $workReport)
    {
        $this->workReport = $workReport;
        $this->taskId = $workReport->task_id;
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
