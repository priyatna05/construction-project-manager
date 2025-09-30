<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Label\StoreLabelRequest;
use App\Http\Requests\Label\UpdateLabelRequest;
use App\Http\Resources\Label\LabelResource;
use App\Models\Label;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabelController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Label::class, 'label');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('Settings/Labels/Index', [
            'items' => LabelResource::collection(
                Label::searchByQueryString()
                    ->sortByQueryString()
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->paginate(12)
            ),
        ]);
    }

    public function store(StoreLabelRequest $request)
    {
        $data = $request->validated();

        if (empty($data['slug']) && !empty($data['name'])) {
            $data['slug'] = str($data['name'])->slug('_');
        }

        Label::create($data);

        return redirect()
            ->route('settings.labels.index')
            ->success('Label created', 'A new label was successfully created.');
    }

    public function update(Label $label, UpdateLabelRequest $request)
    {
        $data = $request->validated();

        if (empty($data['slug']) && !empty($data['name'])) {
            $data['slug'] = str($data['name'])->slug('_');
        }

        $label->update($data);

        return redirect()
            ->route('settings.labels.index')
            ->success('Label updated', 'The label was successfully updated.');
    }

    public function archive(Label $label)
    {
        $this->authorize('archive', $label);

        $label->archive();

        return redirect()->back()->success('Archived', 'Label has been archived.');
    }

    public function restore(int $labelId)
    {
        $label = Label::withArchived()->findOrFail($labelId);

        $this->authorize('restore', $label);

        $label->unArchive();

        return redirect()->back()->success('Label restored', 'The restoring of the label was completed successfully.');
    }

    public function forceDelete(Label $label)
    {
        $this->authorize('delete', $label);

        $label->forceDelete();

        return redirect()->back()->success('Deleted', 'Label has been permanently deleted.');
    }

}
