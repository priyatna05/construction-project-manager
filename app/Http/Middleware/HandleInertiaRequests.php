<?php

namespace App\Http\Middleware;

use App\Models\Role;
use App\Models\Project;
use App\Models\User;
use App\Models\OwnerCompany;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => function () {
                    if (! Auth::check()) {
                        return null;
                    }
                    /** @var User */
                    $user = Auth::user();

                    $hasProjects = $user->hasRole('client')
                        ? Project::query()
                            ->where(function (Builder $query) use ($user) {
                                $query->whereHas(
                                    'users',
                                    fn ($subQuery) => $subQuery->where('users.id', $user->id)
                                )
                                    ->orWhereHas(
                                        'clientCompany.clients',
                                        fn ($subQuery) => $subQuery->where('users.id', $user->id)
                                    )
                                    ->orWhere('client_user_id', $user->id);
                            })
                            ->exists()
                        : true;

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                        'job_title' => $user->job_title,
                        'roles' => $user->getRoleNames(),
                        'permissions' => $user->getAllPermissions()->pluck('name'),
                        'has_projects' => $hasProjects,
                    ];
                },
                'notifications' => NotificationService::getLatest(6),
            ],
            'item' => fn () => OwnerCompany::first(['name', 'logo']),
            'shared' => [
                'roles' => fn () => Role::orderBy('name')->get(['id', 'name'])->toArray(),
            ],
            'flash' => function () {
                $flash = session()->get('flash');
                session()->forget('flash');
                return $flash;
            },
            'version' => config('app.version'),
        ]);
    }
}
