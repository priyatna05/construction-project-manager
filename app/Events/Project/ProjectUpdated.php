<?php

namespace App\Events\Project;

use App\Models\Project;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ProjectUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Project $project;

    public function __construct(Project $project)
    {
        // Kirim data project terbaru ke frontend
        $this->project = $project->fresh();
    }

    public function broadcastOn()
    {
        return new Channel('projects');
    }

    public function broadcastAs()
    {
        return 'project.updated';
    }
}
