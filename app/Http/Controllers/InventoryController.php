<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventory\StoreInventoryRequest;
use App\Http\Resources\Inventory\InventoryResource;
use App\Actions\Inventory\CreateInventoryAction;
use App\Services\Inventory\InventoryService;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Inventory::class, 'inventory');
    }

    public function index(Request $request)
    {
        $inventories = Inventory::filter($request->all())->paginate(15);
        return Inertia::render('Inventory/Index', [
            'inventories' => InventoryResource::collection($inventories),
        ]);
    }

    public function store(StoreInventoryRequest $request, CreateInventoryAction $action)
    {
        $inventory = $action->execute($request->validated());
        event(new \App\Events\InventoryCreated($inventory));
        return redirect()->route('inventories.index')->with('success', 'Inventory created.');
    }

    public function show(Inventory $inventory)
    {
        return Inertia::render('Inventory/Show', [
            'inventory' => new InventoryResource($inventory),
        ]);
    }

    public function update(StoreInventoryRequest $request, Inventory $inventory, InventoryService $service)
    {
        $service->updateInventory($inventory, $request->validated());
        return back()->with('success', 'Inventory updated.');
    }

    public function destroy(Inventory $inventory, InventoryService $service)
    {
        $service->archiveInventory($inventory);
        return back()->with('success', 'Inventory archived.');
    }

    /**
     * adding on here!
     */
}
