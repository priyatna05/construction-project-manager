<?php

namespace App\Http\Controllers\Settings;

use App\Models\Label;
use App\Models\OwnerCompany;
use App\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $company = OwnerCompany::with([
            'country:id,name',
            'currency:id,code,symbol,name',
        ])->first();

        $companyFields = [
            ['label' => 'Company name', 'value' => $company?->name],
            ['label' => 'Logo', 'value' => $company?->logo],
            ['label' => 'Email', 'value' => $company?->email],
            ['label' => 'Phone', 'value' => $company?->phone],
            ['label' => 'Address', 'value' => $company?->address],
            ['label' => 'City', 'value' => $company?->city],
            ['label' => 'Country', 'value' => $company?->country_id],
            ['label' => 'Currency', 'value' => $company?->currency_id],
        ];

        $missingFields = collect($companyFields)
            ->filter(fn ($field) => empty($field['value']))
            ->map(fn ($field) => $field['label'])
            ->values();

        $totalFields = count($companyFields);
        $completionRate = $totalFields > 0
            ? (int) round((($totalFields - $missingFields->count()) / $totalFields) * 100)
            : 0;

        $stats = [
            'roles_total' => Role::count(),
            'roles_archived' => Role::onlyArchived()->count(),
            'labels_total' => Label::count(),
            'labels_archived' => Label::onlyArchived()->count(),
            'permissions_total' => Permission::count(),
        ];

        $health = [
            'company_missing_fields' => $missingFields->count(),
            'roles_without_permissions' => Role::doesntHave('permissions')->count(),
            'labels_without_icon' => Label::where(fn ($query) => $query->whereNull('icon')->orWhere('icon', ''))->count(),
            'labels_without_color' => Label::where(fn ($query) => $query->whereNull('color')->orWhere('color', ''))->count(),
        ];

        $labelTypeCounts = Label::query()
            ->select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'type' => $row->type,
                'total' => (int) $row->total,
            ])
            ->values();

        $recentRoles = Role::query()
            ->withCount('permissions')
            ->latest('updated_at')
            ->limit(5)
            ->get(['id', 'name', 'updated_at', 'created_at'])
            ->map(fn ($role) => [
                'id' => 'role-' . $role->id,
                'type' => 'role',
                'name' => $role->name,
                'permissions_count' => (int) $role->permissions_count,
                'updated_at' => ($role->updated_at ?? $role->created_at)?->toDateTimeString(),
            ]);

        $recentLabels = Label::query()
            ->latest('updated_at')
            ->limit(5)
            ->get(['id', 'name', 'type', 'color', 'icon', 'updated_at', 'created_at'])
            ->map(fn ($label) => [
                'id' => 'label-' . $label->id,
                'type' => 'label',
                'name' => $label->name,
                'label_type' => $label->type,
                'color' => $label->color,
                'icon' => $label->icon,
                'updated_at' => ($label->updated_at ?? $label->created_at)?->toDateTimeString(),
            ]);

        $recentChanges = $recentRoles
            ->merge($recentLabels)
            ->sortByDesc('updated_at')
            ->values()
            ->take(8);

        $companySummary = $company
            ? [
                'name' => $company->name,
                'logo' => $company->logo,
                'email' => $company->email,
                'phone' => $company->phone,
                'web' => $company->web,
                'address' => $company->address,
                'city' => $company->city,
                'postal_code' => $company->postal_code,
                'country' => $company->country
                    ? [
                        'id' => $company->country->id,
                        'name' => $company->country->name,
                    ]
                    : null,
                'currency' => $company->currency
                    ? [
                        'id' => $company->currency->id,
                        'code' => $company->currency->code,
                        'symbol' => $company->currency->symbol,
                        'name' => $company->currency->name,
                    ]
                    : null,
            ]
            : null;

        return Inertia::render('Settings/Index', [
            'company' => $companySummary,
            'companyHealth' => [
                'completion_rate' => $completionRate,
                'missing_fields' => $missingFields,
                'missing_count' => $missingFields->count(),
                'total_fields' => $totalFields,
            ],
            'stats' => $stats,
            'health' => $health,
            'labelTypeCounts' => $labelTypeCounts,
            'recentChanges' => $recentChanges,
        ]);
    }
}
