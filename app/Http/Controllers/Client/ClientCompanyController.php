<?php

namespace App\Http\Controllers\Client;

use App\Actions\ClientCompany\CreateClientCompany;
use App\Actions\ClientCompany\UpdateClientCompany;
use App\Http\Controllers\Controller;
use App\Http\Requests\ClientCompany\StoreClientCompanyRequest;
use App\Http\Requests\ClientCompany\UpdateClientCompanyRequest;
use App\Http\Resources\ClientCompany\ClientCompanyResource;
use App\Models\ClientCompany;
use App\Models\Country;
use App\Models\Currency;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientCompanyController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(ClientCompany::class, 'company');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Clients/Companies/Index', [
            'items' => ClientCompanyResource::collection(
                ClientCompany::searchByQueryString()
                    ->sortByQueryString()
                    ->with([
                        'clients:id,name,avatar',
                        'currency',
                        'country',
                    ])
                    ->when($request->has('archived'), fn($query) => $query->onlyArchived())
                    ->paginate(12)
            ),
            'dropdowns' => [
                'users' => User::userDropdownValues(),
                'clients' => User::clientDropdownValues(),
                'countries' => Country::dropdownValues(),
                'currencies' => Currency::dropdownValues(),
            ],
        ]);
    }

    public function store(StoreClientCompanyRequest $request)
    {
        (new CreateClientCompany)->create($request->validated());

        return redirect()->route('clients.companies.index')->success('Company created', 'A new company was successfully created.');
    }

    public function update(ClientCompany $company, UpdateClientCompanyRequest $request)
    {
        (new UpdateClientCompany)->update($company, $request->validated());

        return redirect()->route('clients.companies.index')->success('Company updated', 'The company was successfully updated.');
    }

    public function destroy(ClientCompany $company)
    {
        $company->archive();

        return redirect()->back()->success('Company archived', 'The company was successfully archived.');
    }

    public function restore(int $companyId)
    {
        $clientCompany = ClientCompany::withArchived()->findOrFail($companyId);

        $this->authorize('restore', $clientCompany);

        $clientCompany->unArchive();

        return redirect()->back()->success('Company restored', 'The restoring of the company was completed successfully.');
    }

    public function forceDelete(int $companyId)
    {
        abort_if(! request()->user()->can('delete client company'), 401);

        $company = ClientCompany::withArchived()->findOrFail($companyId);

        try {
            $company->forceDelete();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return redirect()
                    ->route('clients.companies.index', $redirectParams ?? [])
                    ->warning('Delete failed', 'Cannot delete company because it has related records.');
            }
            throw $e;
        }
         $redirectParams = request()->boolean('archived') ? ['archived' => 1] : [];

        return redirect()
            ->route('clients.companies.index', $redirectParams)
            ->success('Company deleted', 'The client company has been permanently deleted.');
    }
}
