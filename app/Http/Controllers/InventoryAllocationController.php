<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\InventoryTaskAllocation;

class InventoryAllocationController extends Controller
{
    public function store(Request $request)
    {
        InventoryTaskAllocation::create([
            'inventory_id' => $request->inventory_id,
            'task_id' => $request->task_id,
            'quantity_allocated' => $request->quantity,
            'allocation_date' => now(),
            'allocated_by_user_id' => Auth::id(),
            'notes' => $request->notes,
        ]);
    }
}
