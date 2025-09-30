<?php

namespace App\Providers;

use App\Models\Task;
use App\Models\Comment;
use App\Models\Project;
use App\Models\Inventory;
use App\Models\Timesheet;
use App\Observers\TaskObserver;
use App\Events\Task\TaskCreated;
use App\Events\User\UserCreated;
use App\Observers\CommentObserver;
use App\Observers\ProjectObserver;
use App\Events\Task\CommentCreated;
use App\Observers\InventoryObserver;
use App\Observers\TimeSheetObserver;
use App\Listeners\NotifyTaskSubscribers;
use App\Events\TimeSheet\TimesheetApproved;
use App\Listeners\SendEmailWithCredentials;
use App\Listeners\UpdateTaskActualCostFromTimesheet;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        UserCreated::class => [
            SendEmailWithCredentials::class,
        ],
        TaskCreated::class => [
            NotifyTaskSubscribers::class,
        ],
        CommentCreated::class => [
            NotifyTaskSubscribers::class,
        ],
        TimesheetApproved::class => [
            UpdateTaskActualCostFromTimesheet::class,
    ],
        // implement on this other
    ];

    /**
     * The model observers for your application.
     *
     * @var array
     */
    protected $observers = [
        Project::class => [ProjectObserver::class],
        Task::class => [TaskObserver::class],
        Comment::class => [CommentObserver::class],
        Inventory::class => [InventoryObserver::class],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        Inventory::observe(InventoryObserver::class);
        Timesheet::observe(TimeSheetObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
