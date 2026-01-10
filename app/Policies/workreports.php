<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkReport;

class workreports
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, WorkReport $workreport): bool
    {
        return $user->hasPermissionTo('view work reports') && $user->hasProjectAccess($workreport->task->project);
    }
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, WorkReport $workreport): bool
    {
        return $user->hasPermissionTo('view work reports') && $user->hasProjectAccess($workreport->task->project);
    }
    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, WorkReport $workreport): bool
    {
        return $user->hasPermissionTo('create work reports') && $user->hasProjectAccess($workreport->task->project);
    }
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, WorkReport $workreport): bool
    {
        return $user->hasPermissionTo('edit work reports') && $user->hasProjectAccess($workreport->task->project);
    }
    /**
     * Determine whether the user can delete to archive the model.
     */
    public function delete(User $user, WorkReport $workreport): bool
    {
        return $user->hasPermissionTo('archive work reports') && $user->hasProjectAccess($workreport->task->project);
    }
    /**
     * Determine whether the user can delete permanent the model.
     */
    public function forceDelete(User $user, WorkReport $workreport): bool
    {
        return $user->hasPermissionTo('delete work reports') && $user->hasProjectAccess($workreport->task->project);
    }
    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, WorkReport $workreport): bool
    {
        return $user->hasPermissionTo('restore work reports') && $user->hasProjectAccess($workreport->task->project);
    }
}
