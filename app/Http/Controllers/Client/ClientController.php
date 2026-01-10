<?php

namespace App\Http\Controllers\Client;

use App\Http\Resources\Client\ClientResource;
use App\Http\Resources\ClientCompany\ClientCompanyResource;
use App\Http\Controllers\Controller;
use App\Models\ClientCompany;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $startOfMonth = now()->startOfMonth();

        $stats = [
            'total_users' => User::role('client')->count(),
            'total_companies' => ClientCompany::count(),
            'new_users' => User::role('client')->whereDate('created_at', '>=', $startOfMonth)->count(),
            'new_companies' => ClientCompany::whereDate('created_at', '>=', $startOfMonth)->count(),
            'unverified_users' => User::role('client')->whereNull('email_verified_at')->count(),
            'users_without_company' => User::role('client')->doesntHave('clientCompanies')->count(),
            'companies_without_clients' => ClientCompany::doesntHave('clients')->count(),
            'archived_users' => User::onlyArchived()->role('client')->count(),
            'archived_companies' => ClientCompany::onlyArchived()->count(),
        ];

        $recentUsers = User::role('client')
            ->with('clientCompanies:id,name')
            ->latest()
            ->limit(5)
            ->get();

        $recentCompanies = ClientCompany::query()
            ->with('clients:id,name,avatar')
            ->latest()
            ->limit(5)
            ->get();

        $topCountries = DB::table('client_companies')
            ->whereNull('client_companies.archived_at')
            ->join('countries', 'client_companies.country_id', '=', 'countries.id')
            ->select('countries.id', 'countries.name', DB::raw('count(client_companies.id) as total'))
            ->groupBy('countries.id', 'countries.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'label' => $row->name,
                'total' => (int) $row->total,
            ])
            ->values();

        $topCurrencies = DB::table('client_companies')
            ->whereNull('client_companies.archived_at')
            ->join('currencies', 'client_companies.currency_id', '=', 'currencies.id')
            ->select('currencies.id', 'currencies.code', 'currencies.symbol', DB::raw('count(client_companies.id) as total'))
            ->groupBy('currencies.id', 'currencies.code', 'currencies.symbol')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'symbol' => $row->symbol,
                'code' => $row->code,
                'total' => (int) $row->total,
            ])
            ->values();

        return Inertia::render('Clients/Index', [
            'stats' => $stats,
            'recentUsers' => ClientResource::collection($recentUsers),
            'recentCompanies' => ClientCompanyResource::collection($recentCompanies),
            'distribution' => [
                'topCountries' => $topCountries,
                'topCurrencies' => $topCurrencies,
            ],
        ]);
    }
}
