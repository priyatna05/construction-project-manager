<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Label;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\InventoryService;
use App\Actions\Inventory\CreateInventory;
use App\Actions\Inventory\AllocateInventory;
use App\Http\Resources\Inventory\InventoryResource;
use App\Http\Requests\Inventory\StoreInventoryRequest;
use App\Http\Requests\Inventory\UpdateInventoryRequest;
use App\Http\Requests\Inventory\AllocateInventoryRequest;
use Illuminate\Support\Facades\Auth;
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
            'allocations',
            'labels',
        ])
            ->searchByQueryString()
            ->sortByQueryString()
            ->when($request->has('archived'), function($query) {
                return $query->onlyArchived();
            })
            ->paginate(12);

        $inventoryLabels = Label::query()
            ->whereIn('type', [
                Label::TYPE_INVENTORY_TYPE,
                Label::TYPE_INVENTORY_STATUS,
                Label::TYPE_TASK_INVENTORY_UNIT,
            ])
            ->get();

        $types = $inventoryLabels->where('type', Label::TYPE_INVENTORY_TYPE)->values();
        $statuses = $inventoryLabels->where('type', Label::TYPE_INVENTORY_STATUS)->values();
        $units = $inventoryLabels->where('type', Label::TYPE_TASK_INVENTORY_UNIT)->values();

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
            'createdByUser',
            'allocations'
        ]);

        return Inertia::render('Inventories/Show', [
            'inventory' => new InventoryResource($inventory),
        ]);
    }

    public function store(StoreInventoryRequest $request, CreateInventory $action)
    {
        $data = $request->validated();
        $data['created_by_user_id'] = Auth::id();

        $inventory = $action->execute($data);

        event(new \App\Events\Inventory\InventoryCreated($inventory));

        return redirect()
            ->route('inventories.index')
            ->with('flash', [
                'type' => 'success',
                'title' => 'Inventory Created',
                'message' => 'Inventory created successfully.',
            ]);
    }

    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        $this->inventoryService->update($inventory, $request->validated());

        return back()->with('flash', [
            'type' => 'success',
            'title' => 'Inventory Updated',
            'message' => 'Inventory updated successfully.',
        ]);
    }

    public function destroy(Inventory $inventory)
    {
        // Log::info('Attempting to archive inventory', [
        //     'inventory_id' => $inventory->id,
        //     'user_id' => Auth::id(),
        //     'inventory_name' => $inventory->name
        // ]);

        try {
            $this->inventoryService->archive($inventory);
            // Log::info('Inventory archived successfully');

            return back()->with('flash', [
                'type' => 'success',
                'title' => 'Inventory Archived',
                'message' => 'Inventory archived successfully.',
            ]);
        } catch (\Exception $e) {
            // Log::error('Failed to archive inventory', [
            //     'error' => $e->getMessage(),
            //     'inventory_id' => $inventory->id
            // ]);

            return back()->with('flash', [
                'type' => 'error',
                'title' => 'Archive Failed',
                'message' => 'Failed to archive inventory: ' . $e->getMessage(),
            ]);
        }
    }

    public function restore(Request $request, Inventory $inventory)
    {
        $this->inventoryService->restore($inventory);

        return back()->with('flash', [
            'type' => 'success',
            'title' => 'Inventory Restored',
            'message' => 'Inventory restored successfully.',
        ]);
    }

    public function allocate(Inventory $inventory, AllocateInventoryRequest $request, AllocateInventory $action)
    {
        $updated = $action->execute($inventory, $request->validated());

        return back()->with('flash', [
            'type' => 'success',
            'title' => 'Inventory Allocated',
            'message' => "Allocated {$updated->quantity_allocation} units successfully.",
        ]);
    }

    public function forceDelete(Inventory $inventory)
    {
        try {
            $this->authorize('delete inventory', $inventory);

            if (!$inventory->archive()) {
                // Log::warning('Cannot delete unarchived inventory', [
                //     'inventory_id' => $inventory->id
                // ]);
                return redirect()->back()->with('flash', [
                    'type' => 'warning',
                    'title' => 'Action Stopped',
                    'message' => 'Please archive the inventory first before attempting to delete it permanently.',
                ]);
            }

            $inventory->forceDelete();
            $redirectParams = request()->boolean('archived') ? ['archived' => 1] : [];

            return redirect()->route('inventories.index', $redirectParams)
            ->with('flash', [
                'type' => 'success',
                'title' => 'Inventory Deleted',
                'message' => 'Inventory has been permanently deleted.',
            ]);
        } catch (\Exception $e) {
            // Log::error('Failed to force delete inventory', [
            //     'error' => $e->getMessage(),
            //     'inventory_id' => $inventory->id
            // ]);

            return redirect()->to(request()->fullUrl())
            ->with('flash', [
                'type' => 'error',
                'title' => 'Delete Failed',
                'message' => 'Failed to delete inventory: ' . $e->getMessage(),
            ]);
        }
    }
}
