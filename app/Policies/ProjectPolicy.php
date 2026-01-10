<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Services\PermissionService;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        if ($user->hasPermissionTo('view projects')) {
            return true;
        }

        if ($user->hasPermissionTo('view project')) {
            return PermissionService::projectsThatUserCanAccess($user)->isNotEmpty();
        }

        return false;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function view(User $user, Project $project): bool
    {
        return $user->hasPermissionTo('view project') && $user->hasProjectAccess($project);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create project');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        return $user->hasPermissionTo('edit project') && $user->hasProjectAccess($project);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        return $user->hasPermissionTo('archive project') && $user->hasProjectAccess($project);
    }
    /**
     * Determine whether the user can forcedelete the model.
     */
    public function forceDelete(User $user, Project $project): bool
    {
        return $user->hasPermissionTo('force delete project') && $user->hasProjectAccess($project);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Project $project): bool
    {
        return $user->hasPermissionTo('restore project') && $user->hasProjectAccess($project);
    }

    /**
     * Determine whether the user can edit the model user access.
     */
    public function editUserAccess(User $user, Project $project): bool
    {
        return $user->hasPermissionTo('edit project user access') && $user->hasProjectAccess($project);
    }
}
