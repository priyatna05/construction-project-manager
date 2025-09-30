<?php

namespace App\Services;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;

class TaskService
{
    public function createTask(Project $project, array $data): Task
    {
        return DB::transaction(function () use ($project, $data) {
            $task = new Task();
            $task->project_id = $project->id;
            $task->group_id = $data['group_id'];
            $task->number = $data['number'];
            $task->name = $data['name'];
            $task->description = $data['description'] ?? null;
            $task->assigned_to_user_id = $data['assigned_to_user_id'] ?? null;
            $task->start_date = $data['start_date'] ?? null;
            $task->end_date = $data['end_date'] ?? null;
            $task->budget_task = $data['budget_task'] ?? null;
            $task->depends_on_task_id = $data['depends_on_task_id'] ?? null;
            $task->relation_type_id = $data['relation_type_id'] ?? null;
            $task->save();

            if(!empty($data['labels'])){
                $task->labels()->sync($data['labels']);
            }
            if (!empty($data['subscribed_users'])) {
                 $task->subscribedUsers()->sync($data['subscribed_users']);
            }

            if(!empty($data['attachments'])){
                foreach ($data['attachments'] as $file){
                    $task->addMedia(storage_path('app/temp/' . $file))
                        ->preserveingOriginal()
                        ->toMediaCollection('attachments');
                }
            }
            return $task;

        });
    }

    public function updateTask(Task $task, array $validatedData): Task
    {
        return DB::transaction(function () use ($task, $validatedData) {
            // 1. Definisikan semua kunci yang BUKAN kolom database langsung
            $relationKeys = [
                'labels',
                'subscribed_users',
                'attachments',
                'dependencies',
                'inventories'
            ];

            // 2. Pisahkan data: satu untuk kolom tabel, satu untuk relasi/logika lain
            $taskColumnData = Arr::except($validatedData, $relationKeys);
            // 3. Gunakan fill() HANYA dengan data kolom. Ini sekarang aman.
            if (!empty($taskColumnData)) {
                $task->fill($taskColumnData)->save();
            }

            // 4. Handle relasi dan logika lainnya menggunakan $validatedData (data lengkap)

            // Handle relasi 'labels'
            if (array_key_exists('labels', $validatedData)) {
                $task->labels()->sync($validatedData['labels'] ?? []);
            }

            // Handle relasi 'subscribed_users'
            if (isset($validatedData['subscribed_users']) && is_array($validatedData['subscribed_users'])) {
                   $task->subscribedUsers()->sync($validatedData['subscribed_users']);
               }
            // Handle relasi 'dependencies'
           if (array_key_exists('dependencies', $validatedData)) {
            $dependencies = $validatedData['dependencies'];
            $syncData = [];

            if (is_array($dependencies) && !empty($dependencies)) {
                foreach ($dependencies as $dep) {
                    // Pastikan formatnya benar
                    if (isset($dep['id']) && isset($dep['relation_type_id'])) {
                        $syncData[$dep['id']] = [
                            'relation_type_id' => $dep['relation_type_id']
                        ];
                    }
                }
            }

            // Sync akan menghapus yang lama dan menambah yang baru.
            // Jika $dependencies kosong, sync([]) akan menghapus semua dependensi.
            $task->dependencies()->sync($syncData);
            }
            // Handle attachments (logika Anda sudah bagus)
            // Pastikan 'attachments' tidak ada di $fillable model Task
            if (!empty($validatedData['attachments'])) {
                foreach ($validatedData['attachments'] as $file) {
                    // Validasi file existence untuk keamanan
                    if (file_exists(storage_path('app/temp/' . $file))) {
                        $task->addMedia(storage_path('app/temp/' . $file))
                            ->preservingOriginal()
                            ->toMediaCollection('attachments');
                    }
                }
            }
            if (array_key_exists('inventories', $validatedData)) {
                $this->syncInventories($task, $validatedData['inventories'] ?? []);
            }

            // Muat ulang semua relasi yang mungkin telah berubah
           return $task->fresh([
                'project:id,name',
                'taskGroup:id,name',
                'createdByUser:id,name,avatar',
                'assignedToUser:id,name,avatar',
                'subscribedUsers:id',
                'labels:id,name,color',
                'attachments',
                'dependencies',
                'allocatedInventories'
            ]);
        });
    }

    private function syncInventories(Task $task, array $inventoriesData): void
    {
        $syncData = [];
        foreach ($inventoriesData as $item) {
            // Asumsi $item adalah array seperti ['inventory_id' => 1, 'quantity' => 10]
            if (isset($item['inventory_id']) && isset($item['quantity'])) {
                 $syncData[$item['inventory_id']] = [
                    'quantity_allocated' => $item['quantity'],
                    // tambahkan kolom pivot lain jika ada
                    // TODO: Anda perlu mengelola stok utama di tabel 'inventories'.
                // Ini logika terpisah untuk mengurangi/menambah `quantity_on_hand`.
                ];
            }
        }

        // Pastikan Anda memanggil nama relasi yang benar
        $task->inventoryAllocations()->sync($syncData);
    }

    public function moveTask(array $data): Task
    {
        return DB::transaction(function () use ($data) {
            $task = Task::findOrFail($data['task_id']);
            $task->group_id = $data['target_group_id'];
            $task->number = $data['new_order'] ?? $task->number;
            $task->save();

            return $task;
        });
    }

    public function completeTask(Task $task, bool $completed): Task
    {
        return DB::transaction(function () use ($task, $completed) {
            $task->completed_at = $completed ? now() : null;
            $task->save();

            return $task;
        });
    }

    public function archiveTask(array $data): Task
    {
        return DB::transaction(function () use ($data) {
            $task = Task::findOrFail($data['task_id']);
            $task->archived_at = now();
            $task->save();

            return $task;
        });
    }

    public function restoreTask(array $data): Task
    {
        return DB::transaction(function () use ($data) {
            $task = Task::findOrFail($data['task_id']);
            $task->archived_at = null;
            $task->save();

            return $task;
        });
    }
}
