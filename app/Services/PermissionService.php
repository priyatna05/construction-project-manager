<?php

namespace App\Services;

use App\Models\ClientCompany;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Collection;

class PermissionService
{
    public static $permissionsByRole = [
        'admin' => [
            'User' => [
                'view users',
                'create user',
                'edit user',
                'archive user',
                'restore user',
                'delete user',
                ],
            'Label' => [
                'view labels',
                'create label',
                'edit label',
                'archive label',
                'restore label',
                'delete label'
                ],
            'Role' => [
                'view roles',
                'create role',
                'edit role',
                'archive role',
                'restore role',
                'delete role'
                ],
            'Owner Company' => [
                'view owner company',
                'edit owner company'
                ],
            'Client User' => [
                'view client users',
                'create client user',
                'edit client user',
                'archive client user',
                'restore client user',
                'delete client user'
                ],
            'Client Company' => [
                'view client companies',
                'create client company',
                'edit client company',
                'archive client company',
                'restore client company',
                'delete client company'
                ],
            'Project' => [
                'view projects',
                'view project',
                'create project',
                'edit project',
                'archive project',
                'restore project',
                'edit project user access',
                'force delete project'
                ],
            'TaskGroups' => [
                'create task group',
                'edit task group',
                'archive task group',
                'restore task group',
                'reorder task group',
                'delete task group',
                ],
            'Tasks' => [
                'view tasks',
                'create task',
                'edit task',
                'archive task',
                'restore task',
                'reorder task',
                'delete task',
                'complete task',
                'view comments',
                ],
            'WorkReports' => [
                'view work reports',
                'create work reports',
                'edit work reports',
                'archive work reports',
                'restore work reports',
                'delete work reports',
                ],
            'inventory' => [
                'archive inventory',
                'view inventory',
                'create inventory',
                'edit inventory',
                'delete inventory',
                'restore inventory',
                'allocate inventory',
                'view inventory costs',
                'manage inventory costs',
                'export inventory',
                'create inventory allocation',
                'edit inventory allocation',
                'delete inventory allocation'
                ],
            'Activities' => ['view activities'],
            'Overall Stats' => ['view overall stats'],
            'Reports' => [
                'view reports',
                'export reports',
                ],

        ],
        'manager' => [
            'User' => ['view users'],
            'Client User' => [
                'view client users',
                'create client user',
                'archive client user',
                'restore client user',
                ],
            'Client Company' => [
                'view client companies',
                'create client company',
                'archive client company',
                'restore client company',
                ],
            'Project' => [
                'view projects',
                'view project',
                'create project',
                'edit project',
                'archive project',
                'restore project',
                'edit project user access'
                ],
            'TaskGroups' => [
                'create task group',
                'edit task group',
                'archive task group',
                'restore task group',
                'reorder task group',
                'delete task group',
                ],
            'Tasks' => [
                'view tasks',
                'create task',
                'edit task',
                'archive task',
                'restore task',
                'reorder task',
                'delete task',
                'complete task',
                'view comments',
                ],
            'WorkReports' => [
                'view work reports',
                'create work reports',
                'edit work reports',
                'archive work reports',
                'restore work reports',
                'delete work reports',
                ],
            'inventory' => [
                'archive inventory',
                'view inventory',
                'create inventory',
                'edit inventory',
                'allocate inventory',
                'view inventory costs',
                'manage inventory costs',
                'create inventory allocation',
                'edit inventory allocation',
                'delete inventory allocation'
                ],
         'Activities' => ['view activities'],
        'Overall Stats' => ['view overall stats'],
        'Reports' => [
            'view reports',
            'export reports',
            ],
        ],
        'team member' => [
            'Project' => [
                'view projects',
                'view project'
                ],
            'Tasks' => [
                'view tasks',
                'create task',
                'edit task',
                'view comments',
                ],
            'WorkReports' => [
                'view work reports',
                'create work reports',
                'edit work reports',
                ],
            'inventory' => [
                'view inventory allocation',
                ],
        ],
        'client' => [
            'Project' => [
                'view projects',
                'view project'
                ],
            'Tasks' => [
                'view tasks',
                'create task',
                'view comments',
            ],
            'WorkReports' => [
                'view work reports',
                ],
        ],
    ];

    public static function allPermissionsGrouped(): array
    {
        return self::$permissionsByRole['admin'];
    }

    private static $usersWithAccessToProject = [];

    public static function usersWithAccessToProject($project): Collection
    {
        if (isset(self::$usersWithAccessToProject[$project->id])) {
            return self::$usersWithAccessToProject[$project->id];
        }

        $admins = User::role('admin')
            ->with('roles:id,name')
            ->get(['id', 'name', 'avatar', 'email'])
            ->map(fn ($user) => [...$user->toArray(), 'reason' => 'admin']);

        $owners = collect();
        if ($project->clientCompany) {
            $owners = $project
                ->clientCompany
                ->clients
                ->load('roles:id,name')
                ->map(fn ($user) => [...$user->toArray(), 'reason' => 'company owner']);
        } elseif ($project->clientUsers) {
            $owners = collect([$project->clientUsers->load('roles:id,name')])
                ->map(fn ($user) => [...$user->toArray(), 'reason' => 'individual client']);
        }

        $givenAccess = $project
            ->users
            ->load('roles:id,name')
            ->map(fn ($user) => [...$user->toArray(), 'reason' => 'given access']);

        return self::$usersWithAccessToProject[$project->id] = collect([
            ...$admins,
            ...$owners,
            ...$givenAccess,
        ])
            ->unique('id')
            ->sortBy('name')
            ->values();
    }

    private static $projectsThatUserCanAccess = null;

    public static function projectsThatUserCanAccess(User $user): Collection
    {
        if (self::$projectsThatUserCanAccess !== null) {
            return self::$projectsThatUserCanAccess;
        }
        if ($user->hasRole('admin')) {
            return Project::all();
        }
        $projects = collect($user->projects->toArray());
        $user->load('clientCompanies.projects');

        $clientProjects = $projects
            ->merge(
                $user
                    ->clientCompanies
                    ->map(fn (ClientCompany $company) => $company->projects->toArray())
                    ->collapse()
            );

        // Include projects where the user is the direct client (client_user_id)
        $directClientProjects = Project::where('client_user_id', $user->id)->get()->toArray();

        return self::$projectsThatUserCanAccess = $clientProjects
            ->merge($directClientProjects)
            ->unique('id')
            ->sortBy('name')
            ->values();
    }
}
