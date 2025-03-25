<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\Project\ProjectResource;
use App\Models\ClientCompany;
use App\Models\Currency;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    /**
     * Menampilkan daftar proyek dengan filter & pagination
     */
    public function index(Request $request)
    {
        $projects = Project::query()
            ->with([
                'clientCompany:id,name',
                'clientCompany.clients:id,name,avatar',
                'users:id,name,avatar',
            ])
            ->when($request->user()->isNotAdmin(), function ($query) {
                $query->whereHas('clientCompany.clients', fn ($query) => $query->where('users.id', auth()->id()))
                    ->orWhereHas('users', fn ($query) => $query->where('id', auth()->id()));
            })
            ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
            ->withCount([
                'tasks AS all_tasks_count',
                'tasks AS completed_tasks_count' => fn ($query) => $query->whereNotNull('completed_at'),
                'tasks AS overdue_tasks_count' => fn ($query) => $query->whereNull('completed_at')->whereDate('end_date', '<', now()),
            ])
            ->withExists('favoritedByAuthUser AS favorite')
            ->orderBy('favorite', 'desc')
            ->orderBy('name', 'asc')
            ->paginate(10);

        return Inertia::render('Projects/Index', ['items' => ProjectResource::collection($projects)]);
    }

    /**
     * Menampilkan form pembuatan proyek
     */
    public function create()
    {
        return Inertia::render('Projects/Create', [
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'users' => User::userDropdownValues(),
                'currencies' => Currency::dropdownValues(['with' => ['clientCompanies:id,currency_id']]),
            ],
        ]);
    }

    /**
     * Menyimpan proyek baru
     */
    public function store(StoreProjectRequest $request)
    {
        (new ProjectService(new Project))->createProject($request->validated());

        return redirect()->route('projects.index')->success('Project created', 'A new project was successfully created.');
    }

    /**
     * Menampilkan form edit proyek
     */
    public function edit(Project $project)
    {
        return Inertia::render('Projects/Edit', [
            'item' => $project,
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'users' => User::userDropdownValues(),
                'currencies' => Currency::dropdownValues(['with' => ['clientCompanies:id,currency_id']]),
            ],
        ]);
    }

    /**
     * Mengupdate proyek
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        (new ProjectService($project))->updateProject($request->validated());

        return redirect()->route('projects.index')->success('Project updated', 'The project was successfully updated.');
    }

    /**
     * Mengarsipkan proyek
     */
    public function destroy(Project $project)
    {
        $project->archive();

        return redirect()->back()->success('Project archived', 'The project was successfully archived.');
    }

    /**
     * Memulihkan proyek yang diarsipkan
     */
    public function restore(int $projectId)
    {
        $project = Project::withArchived()->findOrFail($projectId);

        $this->authorize('restore', $project);

        $project->unArchive();

        return redirect()->back()->success('Project restored', 'The restoring of the project was completed successfully.');
    }

    /**
     * Mengubah status favorit proyek
     */
    public function favoriteToggle(Project $project)
    {
        request()->user()->toggleFavorite($project);

        return redirect()->back();
    }

    /**
     * Memperbarui akses pengguna ke proyek
     */
    public function userAccess(Request $request, Project $project)
    {
        $this->authorize('editUserAccess', $project);

        $userIds = array_merge(
            $request->get('users', []),
            $request->get('clients', [])
        );

        (new ProjectService($project))->updateUserAccess($userIds);

        return redirect()->back();
    }
}
