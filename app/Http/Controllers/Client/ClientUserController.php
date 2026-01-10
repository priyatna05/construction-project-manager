<?php

namespace App\Http\Controllers\Client;

use App\Actions\Client\CreateClient;
use App\Actions\Client\UpdateClient;
use App\Http\Controllers\Controller;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Http\Resources\Client\ClientResource;
use App\Models\ClientCompany;
use App\Models\Country;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientUserController extends Controller
{
    public function index(Request $request): Response
    {
        abort_if(! $request->user()->can('view client users'), 401);

        return Inertia::render('Clients/Users/Index', [
            'items' => ClientResource::collection(
                User::searchByQueryString()
                    ->sortByQueryString()
                    ->role('client')
                    ->with('clientCompanies')
                    ->when($request->has('archived'), fn($query) => $query->onlyArchived())
                    ->paginate(12)
            ),
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'countries' => Country::dropdownValues(),
                'currencies' => Currency::dropdownValues(),
            ],
        ]);
    }

    public function store(StoreClientRequest $request)
    {
        abort_if(! $request->user()->can('create client user'), 401);

        (new CreateClient)->create($request->validated());

        return redirect()->route('clients.users.index')
            ->with('flash', [
                'type' => 'success',
                'title' => 'Client User',
                'message' => 'Created Success'
            ]);
    }

    public function update(User $user, UpdateClientRequest $request)
    {
        abort_if(! request()->user()->can('edit client user'), 401);

        (new UpdateClient)->update($user, $request->validated());

        return redirect()
            ->route('clients.users.index')
            ->with('flash', [
                'type' => 'success',
                'title' => 'Client User',
                'message' => 'Updated Successfully'
            ]);
    }

    public function destroy(User $user)
    {
        abort_if(! request()->user()->can('archive client user'), 401);

        if (Auth::id() === $user->id) {
            return redirect()->route('clients.users.index')->warning('Action stopped', 'You cannot archive the client with whom you are currently logged in.');
        }
        $user->archive();

        return redirect()->back()->success('Client archived', 'The client was successfully archived.');
    }

    public function restore(int $userId)
    {
        abort_if(! request()->user()->can('restore client user'), 401);

        $user = User::withArchived()->findOrFail($userId);

        $user->unArchive();

        return redirect()->back()->success('Client restored', 'The restoring of the client was completed successfully.');
    }

    public function forceDelete(int $userId)
    {
        abort_if(! request()->user()->can('delete client user'), 401);

        $user = User::withArchived()->findOrFail($userId);

        if (Auth::id() === $user->id) {
            return redirect()->route('clients.users.index')
                ->warning('Action stopped', 'You cannot delete the client user you are currently logged in as.');
        }
        $user->forceDelete();

        $redirectParams = request()->boolean('archived') ? ['archived' => 1] : [];

        return redirect()
            ->route('clients.users.index', $redirectParams)
            ->success('Client deleted', 'The client user has been permanently deleted.');
    }
}
