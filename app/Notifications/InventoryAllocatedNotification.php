<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Inventory;

class InventoryAllocatedNotification extends Notification
{
    use Queueable;

    public Inventory $inventory;

    public function __construct(Inventory $inventory)
    {
        $this->inventory = $inventory;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Inventory Allocated')
                    ->line("{$this->inventory->quantity_allocation} units allocated.")
                    ->action('View Inventory', url('/inventories/'.$this->inventory->id));
    }

    public function toDatabase($notifiable)
    {
        return [
            'inventory_id' => $this->inventory->id,
            'alloc_qty'    => $this->inventory->quantity_allocation,
        ];
    }
}
