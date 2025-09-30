<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\Project\ProjectResource;
use App\Services\ProjectService;
use App\Models\ClientCompany;
use App\Models\Currency;
use App\Models\Project;
use App\Models\User;
use App\Models\Label;
use App\Services\PermissionService;
use Illuminate\Database\Eloquent\Builder;
use App\Models\OwnerCompany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    public function index(Request $request)
    {
        // 1. Definisikan relasi yang ingin dimuat untuk setiap proyek
        $projectRelations = [
            'clientCompany:id,name',
            'users:id,name,avatar',
            'attachments',
        ];

        $query = Project::query()
            ->with($projectRelations)
            // 2. Gunakan whereHas untuk otorisasi yang lebih bersih
            ->when($request->user()->isNotAdmin(), function (Builder $query) use ($request) {
                $query->where(function (Builder $q) use ($request) {
                    $q->whereHas('users', fn ($subQuery) => $subQuery->where('users.id', $request->user()->id))
                      ->orWhereHas('clientCompany.clients', fn ($subQuery) => $subQuery->where('users.id', $request->user()->id));
                });
            })
            // 3. Filter status
            ->when($request->has('archived'), fn (Builder $query) => $query->onlyArchived())
            ->when($request->has('trashed'), fn (Builder $query) => $query->onlyTrashed())
            // 4. Hitung task menggunakan relasi label
            ->withCount([
                'tasks as all_tasks_count',
                'tasks as completed_tasks_count' => function (Builder $query) {
                    $query->whereHas('labels', fn ($q) => $q->where('slug', 'completed'));
                },
                'tasks as overdue_tasks_count' => function (Builder $query) {
                    $query->whereDate('end_date', '<', now())
                          ->whereDoesntHave('labels', fn ($q) => $q->where('slug', 'completed'));
                },
            ])
            ->withExists('favoritedByAuthUser as favorite')
            ->searchByQueryString()
            ->filterByDuration($request->input('duration_min'), $request->input('duration_max'))
            ->orderBy('favorite', 'desc')
            ->orderBy('name', 'asc');

        return Inertia::render('Projects/Index', [
            'items' => ProjectResource::collection($query->get()),
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'users' => User::userDropdownValues(),
                'currencies' => Currency::dropdownValues(['with' => ['clientCompanies:id,currency_id']]),
                'labels' => Label::ofType(Label::TYPE_PROJECT_TASK_STATUS)->get(),
            ],
        ]);
    }

    public function show(Project $project)
    {
        // 1. Definisikan semua relasi yang dibutuhkan oleh halaman detail
        $project->load([
            'clientCompany',
            'users:id,name,avatar',
            'taskGroups',
            'attachments',
            'evmRecords',
            'labels',
            // Muat juga relasi bersarang jika diperlukan oleh komponen lain
            'tasks.labels',
            'tasks.dependencies',
            'inventories',
            'inventories.allocations',
            'inventories.labels',
        ]);

        // 2. Siapkan data untuk dropdown dependensi dengan logika yang benar
        $taskDepends = $project->tasks()
            ->whereDoesntHave('labels', fn ($q) => $q->where('slug', 'completed'))
            ->orderBy('name')
            ->get(['id', 'number', 'name', 'group_id']);

        return Inertia::render('Projects/Detail', [
            'project' => new ProjectResource($project),

            // Data untuk komponen di dalam halaman
            'usersWithAccessToProject' => PermissionService::usersWithAccessToProject($project),
            'taskGroups' => $project->taskGroups,
            'taskDepends' => $taskDepends,
            'taskRelationLabels' => Label::taskRelation()->get(['id', 'name', 'slug', 'color', 'icon']),
            'labels' => Label::ofType(Label::TYPE_PROJECT_TASK_STATUS)->get(),
            'currency' => $project->clientCompany?->currency,
        ]);
    }

    public function create()
    {
        return Inertia::render('Projects/Create', [
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'users' => User::userDropdownValues(),
                'currencies' => Currency::dropdownValues(['with' => ['clientCompanies:id,currency_id']]),
                'labels' => Label::ofType(Label::TYPE_PROJECT_TASK_STATUS)->get(['id', 'name', 'slug', 'color', 'icon']),
            ],
        ]);
    }
    /**
     * Menyimpan proyek baru ke database.
     */
    public function store(StoreProjectRequest $request, ProjectService $projectService)
    {
        $this->authorize('create', Project::class); // penggunaan Policy

        // Panggil service untuk melakukan semua pekerjaan berat
        $project = $projectService->create(
            $request->validated(),
            $request->file('attachments', [])
        );

        $projectUrl = route('projects.detail', $project->id);

        return redirect()->route('projects.index')->with('flash', [
            'type' => 'success',
            'title' => 'Project created',
            'message' => "A new project was successfully created. <a href='{$projectUrl}' style='color: #fff; text-decoration: underline;'>Open Project</a>",
        ]);
    }

    /**
     * Mengupdate proyek yang sudah ada.
     */
    public function update(UpdateProjectRequest $request, Project $project, ProjectService $projectService)
    {
        $this->authorize('update', $project); // Policy

        // Panggil service untuk melakukan semua pekerjaan berat
        $projectService->update(
            $project,
            $request->validated(),
            $request->file('attachments', [])
        );

        return redirect()->route('projects.index')->with('flash', [
            'type' => 'success',
            'title' => 'Project Updated',
            'message' => "Project was successfully Updated.",
        ]);
    }

    public function destroy(Project $project)
    {
        $project->archive();

        return redirect()->back()->success('Project archived', 'The project was successfully archived.');
    }

    public function restore(int $projectId)
    {
        $project = Project::withArchived()->findOrFail($projectId);

        $this->authorize('restore', $project);

        $project->unArchive();

        return redirect()->back()->success('Project restored', 'The restoring of the project was completed successfully.');
    }


    public function forceDelete(Project $project)
    {
        $project = Project::withArchived()->findOrFail($project->id);

        $this->authorize('forceDelete', $project);

        $project->forceDelete();

        return redirect()->back()->success('Project deleted', 'The project was permanently deleted.');
    }

    public function favoriteToggle(Project $project)
    {
        request()->user()->toggleFavorite($project);

        return redirect()->back();
    }

    public function userAccess(Request $request, Project $project)
    {
        $this->authorize('editUserAccess', $project);

        $userIds = array_merge(
            $request->get('users', []),
            $request->get('clients', [])
        );

        (new ProjectService())->updateUserAccess($project, $userIds);

        return redirect()->back();
    }
}
