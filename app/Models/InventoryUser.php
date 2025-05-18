<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int       \$id
 * @property int       \$inventory_id
 * @property int       \$user_id
 * @property Inventory \$inventory
 * @property User      \$user
 */
class InventoryUser extends Model
{
    use HasFactory;

    protected $table = 'inventory_user';

    protected $fillable = [
        'inventory_id',
        'user_id',
    ];

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

     /**
     * Add: more in here!
     */
}
