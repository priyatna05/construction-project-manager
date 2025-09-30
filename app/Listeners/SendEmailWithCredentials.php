<?php

namespace App\Listeners;

use App\Events\User\UserCreated as UserCreatedEvent;
use App\Notifications\UserCreatedNotification;

class SendEmailWithCredentials
{
    /**
     * Handle the event.
     */
    public function handle(UserCreatedEvent $event): void
    {
        $event->user->notify(
            new UserCreatedNotification($event->password)
        );
    }
}
