<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Http\Resources\Inventory\InventoryResource;
use Inertia\Inertia;
use App\Models\Inventory;
use App\Models\ClientCompany;
use App\Models\User;
use App\Models\Currency;
use App\Services\InventoryService;


class InventoryController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Inventory::class, 'inventories');
    }

    public function index(Request $request)
    {
        return Inertia::render('Inventories/Index', [
            'items' => InventoryResource::collection(
                Inventory::searchByQueryString()
                    ->when($request->user()->isNotAdmin(), function ($query) {
                        $query->whereHas('clientCompany.clients', fn ($query) => $query->where('users.id', auth()->id()))
                            ->orWhereHas('users', fn ($query) => $query->where('id', auth()->id()));
                    })
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->when($request->has('trashed'), fn ($query) => $query->onlyTrashed())
                    ->with([
                        'clientCompany:id,name',
                        'clientCompany.clients:id,name,avatar',
                        'users:id,name,avatar',
                    ])
                    // ->withCount([
                    //     'inventories AS all_inventories_count',
                    //     'inventories AS completed_inventories_count',
                    //     'inventories AS overdue_inventories_count',
                    // ])
                    // ->withExists('favoritedByAuthUser AS favorite')
                    // ->orderBy('favorite', 'desc')
                    ->orderBy('name_inventory', 'asc')
                    ->get()
            ),
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventories/Create', [
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'users' => User::userDropdownValues(),
                'currencies' => Currency::dropdownValues(['with' => ['clientCompanies:id,currency_id']]),
            ],
        ]);
    }

    public function store(StoreInventoryRequest $request)
    {
        $inventory = $this->inventoryService->createInventory($request->validated());

        return redirect()
            ->route('inventories.show', $inventory)
            ->with('success', __('Inventories created successfully.'));
    }

    public function edit(Inventory $inventory)
    {
        return Inertia::render('Inventories/Edit', [
            'inventories' => $inventory->load(['clientCompany:id,name', 'clientCompany.clients:id,name,avatar']),
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'users' => User::userDropdownValues(),
                'currencies' => Currency::dropdownValues(['with' => ['clientCompanies:id,currency_id']]),
            ],
        ]);
    }

    public function update(UpdateInventoryRequest $request, Inventory $inventory)
    {
        $inventory->update($request->validated());

        return redirect()
            ->route('inventories.show', $inventory)
            ->with('success', __('Inventories updated successfully.'));
    }

    public function destroy(Inventory $inventory)
    {
        $inventory->delete();

        return redirect()
            ->route('inventories.index')
            ->with('success', __('Inventories deleted successfully.'));
    }

}
