<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Label;
use Illuminate\Http\Request;
use App\Services\InventoryService;
use App\Actions\Inventory\CreateInventory;
use App\Actions\Inventory\AllocateInventory;
use App\Http\Resources\Inventory\InventoryResource;
use App\Http\Requests\Inventory\StoreInventoryRequest;
use App\Http\Requests\Inventory\UpdateInventoryRequest;
use App\Http\Requests\Inventory\AllocateInventoryRequest;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;

        $this->authorizeResource(Inventory::class, 'inventory');
    }

    public function index(Request $request): Response
    {
        $inventories = Inventory::with([
             'createdByUser:id,name,avatar',
             'projectSiteLocation.users',
             'projectSiteLocation.clientCompany.clients',
             'allocations',
             'labels',
             ])
            ->searchByQueryString()
            ->sortByQueryString()
            ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
            ->paginate(12);
        $inventoryLabels = Label::query()
        ->whereIn('type', [
            Label::TYPE_INVENTORY_TYPE,
            Label::TYPE_INVENTORY_STATUS,
            Label::TYPE_INVENTORY_UNIT,
        ])
        ->get();
        $types = $inventoryLabels->where('type', Label::TYPE_INVENTORY_TYPE)->values();
        $statuses = $inventoryLabels->where('type', Label::TYPE_INVENTORY_STATUS)->values();
        $units = $inventoryLabels->where('type', Label::TYPE_INVENTORY_UNIT)->values();


        return Inertia::render('Inventories/Index', [
            'items' => InventoryResource::collection($inventories),
            'types' => $types,
            'statuses' => $statuses,
            'units' => $units,
        ]);
    }

    public function show(Inventory $inventory): Response
    {
            $inventory->loadMissing([
            'labels',
            'projectSiteLocation.clientCompany.clients',
            'projectSiteLocation.users',
            'createdByUser',
            'allocations'
        ]);

        return Inertia::render('Inventories/Show', [
            'inventory' => new InventoryResource($inventory),
        ]);
    }

    public function store(StoreInventoryRequest $request, CreateInventory $action)
    {
        $inventory = $action->execute($request->validated());

        event(new \App\Events\Inventory\InventoryCreated($inventory));

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Inventory created successfully',
                'inventory' => $inventory,
            ]);
        }

        return redirect()->route('inventories.index')->with('success', 'Inventory created.');
    }

    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        $this->inventoryService->update($inventory, $request->validated());

        return back()->with('success', 'Inventory updated.');
    }

    public function destroy(Inventory $inventory)
    {
        $this->inventoryService->archive($inventory);

        return back()->with('success', 'Inventory archived.');
    }

    public function restore(Request $request, Inventory $inventory)
    {
        $this->inventoryService->restore($inventory);

        return back()->with('success', 'Inventory restored.');
    }

    public function allocate(Inventory $inventory, AllocateInventoryRequest $request, AllocateInventory $action)
    {
        $updated = $action->execute($inventory, $request->validated());

        return back()->with('success', "Allocated {$updated->quantity_allocation} units.");
    }

    public function forceDelete(Inventory $inventory)
    {
        $this->authorize('delete', $inventory);

        request()->validate([
            'password' => ['required', 'current_password'],
        ]);

        if (! $inventory->trashed()) {
            return redirect()->back()->warning('Action stopped', 'Inventory must be archived before it can be deleted permanently.');
        }

        $inventory->forceDelete();

        return redirect()->route('inventories.index')->success('Deleted', 'Inventory has been permanently deleted.');
    }

}
