<?php

namespace App\Services;

use App\Models\Project;
use App\Actions\TaskGroup\GenerateTaskGroupsAction;
use App\Actions\Attachment\StoreAttachmentAction;
use App\Notifications\ProjectCompletedNotification;
use App\Notifications\ProjectUnlockedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\Label;
use Illuminate\Support\Facades\Log;

class ProjectService
{
    public function create(array $validatedData, array $files = []): Project
    {
        return DB::transaction(function () use ($validatedData, $files) {

            if (!empty($validatedData['client_company_id']) && str_starts_with($validatedData['client_company_id'], 'user_')) {
                $validatedData['client_user_id'] = (int) str_replace('user_', '', $validatedData['client_company_id']);
                $validatedData['client_company_id'] = null;
            }
            foreach (['start_date', 'end_date'] as $dateField) {
                if (isset($validatedData[$dateField]) && is_string($validatedData[$dateField])) {
                    $val = $validatedData[$dateField];
                    $normalized = null;
                    try {
                        $normalized = \Carbon\Carbon::createFromFormat('Y-m-d', $val)->toDateString();
                    } catch (\Exception $_e1) {
                        try {
                            $normalized = \Carbon\Carbon::createFromFormat('d-m-Y', $val)->format('Y-m-d');
                        } catch (\Exception $_e2) {
                            try {
                                $dt = \Carbon\Carbon::parse($val);
                                $dt->setTimezone(config('app.timezone'));
                                $normalized = $dt->toDateString();
                            } catch (\Exception $_e3) {
                            }
                        }
                    }

                    if ($normalized) {
                        // Log::info('Normalized create date field', [$dateField => $normalized]);
                        $validatedData[$dateField] = $normalized;
                    }
                }
            }

            $project = Project::create($validatedData);

            if (isset($validatedData['users'])) {
                $project->users()->attach($validatedData['users']);
            }

            if (!empty($validatedData['type_id'])) {
                $label = Label::where('slug', $validatedData['type_id'])->where('type', Label::TYPE_KONTRAK)->first();
                if ($label) {
                    $project->labels()->attach($label->id);
                }
            }

            if (!empty($validatedData['status_ids'])) {
                $statusLabels = Label::whereIn('slug', $validatedData['status_ids'])
                    ->where('type', Label::TYPE_PROJECT_TASK_STATUS)
                    ->pluck('id')
                    ->toArray();
                $project->labels()->attach($statusLabels);
            }

            // Log::info('Project labels attached:', [
            //     'project_id' => $project->id,
            //     'type_id' => $validatedData['type_id'] ?? null,
            //     'status_ids' => $validatedData['status_ids'] ?? [],
            //     'current_labels' => $project->labels->pluck('id')->toArray(),
            // ]);

            foreach ($project->users as $user) {
                $user->notify(new \App\Notifications\ProjectCreatedNotification($project));
            }

            if ($project->clientCompany) {
                foreach ($project->clientCompany->clients as $client) {
                    $client->notify(new \App\Notifications\ProjectCreatedNotification($project));
                }
            }

            if ($project->clientUsers) {
                $project->clientUsers->notify(new \App\Notifications\ProjectCreatedNotification($project));
            }

            foreach ($files as $file) {
                (new StoreAttachmentAction())->execute($project, $file);
            }

            (new GenerateTaskGroupsAction())->execute($project, $validatedData['generate_task_groups'] ?? null);

            return $project;
        });
    }

    public function update(Project $project, array $validatedData, array $newAttachmentFiles = []): Project
    {
        return DB::transaction(function () use ($project, $validatedData, $newAttachmentFiles) {
            $wasCompleted = (bool) $project->is_completed;
            $dataToUpdate = collect($validatedData)->except([
                'users',
                'type_id',
                'status_ids',
                'deleted_attachments_ids',
                'attachment_files',
            ])->toArray();

            foreach (['start_date', 'end_date'] as $dateField) {
                if (isset($dataToUpdate[$dateField]) && is_string($dataToUpdate[$dateField])) {
                    $val = $dataToUpdate[$dateField];
                    $normalized = null;
                    try {
                        $normalized = \Carbon\Carbon::createFromFormat('Y-m-d', $val)->toDateString();
                    } catch (\Exception $_e1) {
                        try {
                            $normalized = \Carbon\Carbon::createFromFormat('d-m-Y', $val)->format('Y-m-d');
                        } catch (\Exception $_e2) {
                            try {
                                $dt = \Carbon\Carbon::parse($val);
                                $dt->setTimezone(config('app.timezone'));
                                $normalized = $dt->toDateString();
                            } catch (\Exception $_e3) {
                            }
                        }
                    }

                    if ($normalized) {
                        $dataToUpdate[$dateField] = $normalized;
                    }
                }
            }

            if (array_key_exists('completed_at', $dataToUpdate)) {
                $dataToUpdate['completed_at'] = $dataToUpdate['completed_at']
                    ? \Carbon\Carbon::parse($dataToUpdate['completed_at'])
                    : null;
            }

            foreach (['start_date', 'end_date'] as $dateField) {
                if (isset($dataToUpdate[$dateField])) {
                    // Log::info('Assigning date to model field', [$dateField => $dataToUpdate[$dateField]]);
                    $project->{$dateField} = $dataToUpdate[$dateField];
                    unset($dataToUpdate[$dateField]);
                }
            }

            $project->update($dataToUpdate);
            $project->save();
            if (isset($validatedData['users'])) {
                $project->users()->sync($validatedData['users']);
            }

            if (isset($validatedData['type_id'])) {
                $typeLabel = Label::where('slug', $validatedData['type_id'])
                    ->where('type', Label::TYPE_KONTRAK)
                    ->first();

                if ($typeLabel) {
                    $currentTypeLabels = $project->labels()->where('labels.type', Label::TYPE_KONTRAK)->pluck('labels.id')->toArray();
                    if (!empty($currentTypeLabels)) {
                        $project->labels()->detach($currentTypeLabels);
                    }
                    $project->labels()->attach($typeLabel->id);
                }
            }

            if (isset($validatedData['status_ids'])) {
                $oldStatusLabelIds = $project->labels()->where('labels.type', Label::TYPE_PROJECT_TASK_STATUS)->pluck('labels.id')->toArray();
                if (!empty($oldStatusLabelIds)) {
                    $project->labels()->detach($oldStatusLabelIds);
                }
                $statusLabels = Label::whereIn('slug', $validatedData['status_ids'])
                    ->where('type', Label::TYPE_PROJECT_TASK_STATUS)
                    ->pluck('id')
                    ->toArray();
                $project->labels()->attach($statusLabels);
            }


            $deletedIds = $validatedData['deleted_attachments_ids'] ?? [];

            $project->attachments()->whereIn('id', $deletedIds)->get()->each(function ($attachment) {
                if ($attachment->path) {
                    Storage::disk($attachment->disk)->delete($attachment->path);
                }
                if ($attachment->thumb) {
                    Storage::disk($attachment->disk)->delete($attachment->thumb);
                }
                $attachment->delete();
            });

            if (isset($validatedData['existing_attachments'])) {
                foreach ($validatedData['existing_attachments'] as $existingAttachment) {
                    $project->attachments()
                        ->where('id', $existingAttachment['id'])
                        ->update(['is_main' => $existingAttachment['is_main'] ?? false]);
                }
            }

            foreach ($newAttachmentFiles as $file) {
                (new StoreAttachmentAction())->execute($project, $file);
            }

            $project->refresh();

            if (!$wasCompleted && $project->is_completed) {
                if (!$project->completed_at) {
                    $project->completed_at = now();
                    $project->save();
                }

                $this->notifyCompletion($project);
            } elseif ($wasCompleted && !$project->is_completed) {
                $this->notifyUnlock($project);
            }

            return $project;
        });
    }

    public function updateUserAccess(Project $project, array $userIds): void
    {
        $project->users()->sync($userIds);
    }

    public static function calculateDirectCostPlan(Project $project): float
    {
        return $project->tasks()->sum('budget_task_plan');
    }

    public static function calculateDirectCostActual(Project $project): float
    {
        return $project->tasks()->sum('budget_task_actual');
    }

    public static function updateCalculatedFields(Project $project): void
    {
        $directPlan = self::calculateDirectCostPlan($project);
        $directActual = self::calculateDirectCostActual($project);

        $project->update([
            'direct_cost_plan' => $directPlan,
            'direct_cost_actual' => $directActual,
        ]);

        $calculations = self::calculateCosts($project);

        $project->update($calculations);

        $project->save();
    }

    public static function calculateCosts(Project $project): array
    {
        $directPlan = $project->direct_cost_plan ?? 0;
        $directActual = $project->direct_cost_actual ?? 0;

        // Plan calculations
        $overheadPlan = ($directPlan * $project->overhead_site_rate) / 100;
        $adminPlan = ($directPlan * $project->administrative_rate) / 100;
        $contingencyPlan = ($directPlan * $project->contingency_rate) / 100;
        $subtotalBeforeProfitPlan = $directPlan + $overheadPlan + $adminPlan + $contingencyPlan;
        $profitPlan = ($subtotalBeforeProfitPlan * $project->profit_rate) / 100;
        $subtotalBeforeTaxPlan = $subtotalBeforeProfitPlan + $profitPlan;
        $taxPlan = ($subtotalBeforeTaxPlan * $project->tax_rate) / 100;
        $grandTotalPlan = $subtotalBeforeTaxPlan + $taxPlan;

        // Actual calculations
        $overheadActual = ($directActual * $project->overhead_site_rate) / 100;
        $adminActual = ($directActual * $project->administrative_rate) / 100;
        $contingencyActual = ($directActual * $project->contingency_rate) / 100;
        $subtotalBeforeProfitActual = $directActual + $overheadActual + $adminActual + $contingencyActual;
        $profitActual = ($subtotalBeforeProfitActual * $project->profit_rate) / 100;
        $subtotalBeforeTaxActual = $subtotalBeforeProfitActual + $profitActual;
        $taxActual = ($subtotalBeforeTaxActual * $project->tax_rate) / 100;
        $grandTotalActual = $subtotalBeforeTaxActual + $taxActual;

        return [
            // Plan
            'overhead_site_cost_plan' => $overheadPlan,
            'administrative_cost_plan' => $adminPlan,
            'contingency_cost_plan' => $contingencyPlan,
            'profit_cost_plan' => $profitPlan,
            'tax_cost_plan' => $taxPlan,
            'budget_project_final_plan' => $subtotalBeforeProfitPlan,
            'budget_project_grandtotal_plan' => $grandTotalPlan,

            // Actual
            'overhead_site_cost_actual' => $overheadActual,
            'administrative_cost_actual' => $adminActual,
            'contingency_cost_actual' => $contingencyActual,
            'profit_cost_actual' => $profitActual,
            'tax_cost_actual' => $taxActual,
            'budget_project_actual' => $subtotalBeforeProfitActual,
            'budget_project_grandtotal_actual' => $grandTotalActual,
        ];
    }

    protected function notifyCompletion(Project $project): void
    {
        $project->loadMissing(['users:id,email,name', 'clientCompany.clients:id,email,name', 'clientUsers:id,email,name']);

        $recipients = collect()
            ->merge($project->users)
            ->merge($project->clientCompany?->clients ?? collect())
            ->merge($project->clientUsers ? [$project->clientUsers] : [])
            ->unique('id')
            ->filter();

        $notification = new ProjectCompletedNotification($project);

        foreach ($recipients as $recipient) {
            $recipient->notify($notification);
        }
    }

    protected function notifyUnlock(Project $project): void
    {
        $project->loadMissing(['users:id,email,name', 'clientCompany.clients:id,email,name', 'clientUsers:id,email,name']);

        $recipients = collect()
            ->merge($project->users)
            ->merge($project->clientCompany?->clients ?? collect())
            ->merge($project->clientUsers ? [$project->clientUsers] : [])
            ->unique('id')
            ->filter();

        $notification = new \App\Notifications\ProjectUnlockedNotification($project);

        foreach ($recipients as $recipient) {
            $recipient->notify($notification);
        }
    }
}
