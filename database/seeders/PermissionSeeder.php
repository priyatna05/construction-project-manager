<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Services\PermissionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $insertPermissions = fn (string $role) => collect(PermissionService::$permissionsByRole[$role] ?? [])
            ->flatten()
            ->unique()
            ->map(function ($name) {
                $permission = DB::table('permissions')->where('name', $name)->first();

                return $permission
                    ? $permission->id
                    : DB::table('permissions')->insertGetId([
                        'name' => $name,
                        'guard_name' => 'web',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
            })
            ->values()
            ->toArray();

        $permissionIdsByRole = [
            'admin'       => $insertPermissions('admin'),
            'manager'     => $insertPermissions('manager'),
            'team member' => $insertPermissions('team member'),
            'client'      => $insertPermissions('client'),
        ];

        foreach ($permissionIdsByRole as $roleName => $permissionIds) {
            $role = Role::whereName($roleName)->first();

            if (!$role) {
                // Kalau role belum ada, skip atau create sesuai kebutuhan
                continue;
            }

            // ✅ Ini yang bikin seeder aman dijalankan berulang kali
            $role->permissions()->sync($permissionIds);
            // atau: $role->syncPermissions($permissionIds); (kalau Role kamu extends Spatie)
        }

        Artisan::call('cache:clear');
    }
}
