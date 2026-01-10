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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    public function index(Request $request)
    {
        $projectRelations = [
            'clientCompany:id,name',
            'clientUsers:id,name,email,avatar',
            'users:id,name,avatar',
            'attachments',
            'labels',
        ];

        $query = Project::query()
            ->with($projectRelations)
            ->when($request->user()->isNotAdmin(), function (Builder $query) use ($request) {
                $query->where(function (Builder $q) use ($request) {
                    $q->whereHas(
                        'users',
                        fn($subQuery) =>
                        $subQuery->where('users.id', $request->user()->id)
                    )
                        ->orWhereHas(
                            'clientCompany.clients',
                            fn($subQuery) =>
                            $subQuery->where('users.id', $request->user()->id)
                        )
                        ->orWhere('client_user_id', $request->user()->id);
                });
            })
            ->when($request->has('archived'), fn(Builder $query) => $query->onlyArchived())
            ->when($request->has('trashed'), fn(Builder $query) => $query->onlyTrashed())
            ->withCount([
                'tasks as all_tasks_count',
                'tasks as completed_tasks_count' => function (Builder $query) {
                    $query->whereHas('labels', fn($q) => $q->where('slug', 'completed'));
                },
                'tasks as overdue_tasks_count' => function (Builder $query) {
                    $query->whereDate('end_date', '<', now())
                        ->whereDoesntHave('labels', fn($q) => $q->where('slug', 'completed'));
                },
            ])
            ->withExists('favoritedByAuthUser as favorite')
            ->searchByQueryString()
            ->sortByQueryString()
            ->filterByDuration($request->input('duration_min'), $request->input('duration_max'))
            ->orderBy('favorite', 'desc')
            ->orderBy('name', 'asc');

        return Inertia::render('Projects/Index', [
            'items' => ProjectResource::collection($query->get()),
            'dropdowns' => [
                'companies' => ClientCompany::has('clients')
                    ->with(['clients:id,name,avatar'])
                    ->withCount('clients as users_count')
                    ->get(['id', 'name'])
                    ->map(fn($c) => [
                        'value' => (string) $c->id,
                        'label' => $c->name,
                        'users_count' => $c->users_count,
                        'users' => $c->clients->map(fn($u) => [
                            'id' => $u->id,
                            'full_name' => $u->name,
                            'initial' => strtoupper(substr($u->name, 0, 1)),
                            'avatar' => $u->avatar,
                        ]),
                    ]),

                'users' => User::userDropdownValues(['client'], $request->user()->id),
                'clients' => User::clientDropdownValues(),
                'clientUsers' => User::role('client')
                    ->doesntHave('clientCompanies')
                    ->get(['id', 'name', 'avatar']),

                'currencies' => Currency::dropdownValues(['with' => ['clientCompanies:id,currency_id']]),
                'types' => Label::ofType(Label::TYPE_KONTRAK)->get(),
                'status' => Label::ofType(Label::TYPE_PROJECT_TASK_STATUS)->get(['id', 'name', 'slug', 'color', 'icon']),
            ],
        ]);
    }

    public function show(Project $project)
    {
        return redirect()->route('projects.tasks', $project->id);
    }

    /**
     * Menyimpan proyek baru ke database.
     */
    public function store(StoreProjectRequest $request, ProjectService $projectService)
    {
        $this->authorize('create', Project::class);
        $project = $projectService->create(
            $request->validated(),
            $request->file('attachment_files', [])
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

        $this->authorize('update', $project);
        $validatedData = $request->validated();
        $newAttachmentFiles = $request->file('attachment_files', []);
        $validatedData['deleted_attachments_ids'] = $request->get('deleted_attachments_ids', []);

        $wasCompleted = (bool) $project->is_completed;

        $projectService->update(
            $project,
            $validatedData,
            $newAttachmentFiles
        );

        $project->refresh();
        $isCompletedNow = (bool) $project->is_completed;

        $flash = [
            'type' => 'success',
            'title' => 'Project Updated',
            'message' => "Project was successfully updated.",
        ];

        if ($wasCompleted && !$isCompletedNow) {
            $flash = [
                'type' => 'success',
                'title' => 'Project Unlocked',
                'message' => 'Project has been unlocked and is editable again.',
            ];
        } elseif (!$wasCompleted && $isCompletedNow) {
            $flash = [
                'type' => 'success',
                'title' => 'Project Locked',
                'message' => 'Project has been marked as completed and locked.',
            ];
        }

        return redirect()->route('projects.index')->with('flash', $flash);
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
