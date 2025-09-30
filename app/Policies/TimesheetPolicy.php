<?php

namespace App\Policies;

use App\Models\Timesheet;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TimesheetPolicy
{
    use HandlesAuthorization;

    /**
     * Allow admin to perform any action.
     */
    public function before(User $user, string $ability): bool|null
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        return null; // continue to other methods
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Timesheet $timesheet): bool
    {
        // User bisa melihat timesheetnya sendiri atau jika dia manager/admin (sudah dihandle 'before')
        return $user->id === $timesheet->user_id || $user->hasRole('manager');
    }

    public function create(User $user): bool
    {
        return true; // Semua user terautentikasi bisa mencoba membuat timesheet
    }

    public function update(User $user, Timesheet $timesheet): bool
    {
        // Hanya bisa update jika status 'Pending' DAN user adalah pemilik, ATAU user adalah manager
        if ($timesheet->status === 'Pending') {
            return $user->id === $timesheet->user_id || $user->hasRole('manager');
        }
        // Manager bisa update status yang sudah tidak pending
        return $user->hasRole('manager');
    }

    public function delete(User $user, Timesheet $timesheet): bool
    {
        if ($timesheet->status === 'Pending') {
            return $user->id === $timesheet->user_id || $user->hasRole('manager');
        }
        // Hanya manager yang bisa hapus yang sudah tidak pending (misal salah approve)
        return $user->hasRole('manager');
    }

    public function approve(User $user, Timesheet $timesheet): bool
    {
        // Hanya manager yang bisa approve dan jika statusnya Pending
        return $user->hasRole('manager') && $timesheet->status === 'Pending';
    }

    public function reject(User $user, Timesheet $timesheet): bool
    {
        // Hanya manager yang bisa reject, bisa dari Pending atau Approved (untuk koreksi)
        return $user->hasRole('manager') && in_array($timesheet->status, ['Pending', 'Approved']);
    }

    // public function restore(User $user, Timesheet $timesheet): bool
    // {
    //     return $user->hasRole('manager');
    // }

    // public function forceDelete(User $user, Timesheet $timesheet): bool
    // {
    //     return $user->hasRole('admin');
    // }
}
