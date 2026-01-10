<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('exposes calendar events, users, and clients to the dashboard view', function () {
    $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $user = User::factory()->create();
    $user->assignRole($adminRole);

    $project = Project::create([
        'code' => 'PRJ-00001',
        'name' => 'Calendar Test Project',
        'description' => 'Project for calendar exposure test',
        'direct_cost_plan' => 0,
        'direct_cost_actual' => 0,
        'overhead_site_rate' => 0,
        'administrative_rate' => 0,
        'contingency_rate' => 0,
        'profit_rate' => 0,
        'tax_rate' => 0,
    ]);
    $taskGroup = TaskGroup::create([
        'project_id' => $project->id,
        'name' => 'Milestones',
        'description' => 'Calendar testing group',
        'order_column' => 1,
    ]);

    $endDate = Carbon::now()->addDay();
    $task = Task::create([
        'project_id' => $project->id,
        'group_id' => $taskGroup->id,
        'created_by_user_id' => $user->id,
        'name' => 'Calendar Task',
        'description' => 'Make sure dashboard exposes events',
        'start_date' => now()->toDateString(),
        'end_date' => $endDate->toDateString(),
        'order_column' => 1,
        'progress_task' => 0,
        'weight_task' => 0,
        'unit_cost_task' => 0,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Index')
            ->has('calendarEvents', fn (Assert $events) => $events
                ->where('0.id', $task->id)
                ->where('0.title', $task->name)
                ->where('0.type', 'task')
                ->where('0.date', fn ($date) => ! empty($date))
            )
            ->has('users')
            ->has('clients')
        );
    $this->assertTrue(true);
});
