<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Timesheet;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use App\Models\Project; // Untuk mengambil project
use App\Models\Task; // Untuk mengambil task saat membuat timesheet

class TimesheetController extends Controller
{
    public function index(Request $request)
    {
        // Filter timesheets berdasarkan user, project, task, status, date range, dll.
        $query = Timesheet::with(['user:id,name', 'task:id,name', 'project:id,name', 'approver:id,name'])
                    ->orderBy('entry_date', 'desc')
                    ->orderBy('created_at', 'desc');

        // Filter by current user (non-admin/manager)
        if (!Auth::user()->hasRole(['admin', 'manager'])) {
            $query->where('user_id', Auth::id());
        }

        // Contoh filter tambahan (bisa dari request query string)
        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('task_id')) {
            $query->where('task_id', $request->task_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        // Filter date range, dll.

        $timesheets = $query->paginate(15)->withQueryString();

        return Inertia::render('Projects/Tasks/Timesheets/Index', [
            'timesheets' => $timesheets,
            'filters' => $request->only(['project_id', 'task_id', 'status']), // Kirim filter kembali ke view
            // Kirim juga data untuk dropdown filter jika perlu
            'projects' => Project::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        // Ambil data yang dibutuhkan untuk form create (misal: daftar task user)
        $user = Auth::user();
        // Tasks yang diassign ke user dan belum selesai (contoh)
        $tasks = Task::where('assigned_to_user_id', $user->id)
                     // ->where('progress_task', '<', 100) // Opsional: hanya task yg belum selesai
                     ->with('project:id,name') // Eager load project
                     ->orderBy('name')
                     ->get()
                     ->map(function ($task) {
                         return [
                             'id' => $task->id,
                             'name' => $task->name . ($task->project ? ' (' . $task->project->name . ')' : ''),
                             'project_id' => $task->project_id,
                         ];
                     });


        return Inertia::render('Timesheets/Create', [
            'tasks' => $tasks,
            // Default hourly rate bisa diambil dari user atau setting aplikasi
            'defaultHourlyRate' => $user->default_hourly_rate ?? config('app.default_hourly_rate', 0),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'entry_date' => 'required|date|before_or_equal:today',
            'hours_worked' => 'required|numeric|min:0.01|max:24',
            'hourly_rate' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
        ]);

        $task = Task::findOrFail($validated['task_id']);

        Auth::user()->timesheets()->create([
            'task_id' => $task->id,
            'project_id' => $task->project_id, // Ambil dari task
            'entry_date' => $validated['entry_date'],
            'hours_worked' => $validated['hours_worked'],
            'hourly_rate' => $validated['hourly_rate'] ?? null, // Biarkan model menghitung cost
            'description' => $validated['description'],
            'status' => 'Pending', // Default status
        ]);

        return Redirect::route('timesheets.index')->with('success', 'Timesheet created successfully.');
    }

    public function edit(Timesheet $timesheet)
    {
        // Autorisasi: hanya pemilik atau admin/manager yang bisa edit
        $this->authorize('update', $timesheet); // Kita akan buat Policy nanti

        if ($timesheet->status !== 'Pending' && !Auth::user()->hasRole(['admin', 'manager'])) {
             return Redirect::back()->with('error', 'Cannot edit timesheet that is not pending.');
        }


        $user = Auth::user();
         $tasks = Task::where('assigned_to_user_id', $timesheet->user_id) // atau $user->id jika hanya user sendiri
                     ->with('project:id,name')
                     ->orderBy('name')
                     ->get()
                     ->map(function ($task) {
                         return [
                             'id' => $task->id,
                             'name' => $task->name . ($task->project ? ' (' . $task->project->name . ')' : ''),
                             'project_id' => $task->project_id,
                         ];
                     });

        $timesheet->load(['user:id,name', 'task:id,name', 'project:id,name']);

        return Inertia::render('Timesheets/Edit', [
            'timesheet' => $timesheet,
            'tasks' => $tasks,
        ]);
    }

    public function update(Request $request, Timesheet $timesheet)
    {
        $this->authorize('update', $timesheet);

        // Jika status bukan 'Pending' dan user bukan admin/manager, hanya field tertentu yang boleh diubah
        // atau tidak boleh diubah sama sekali.
        if ($timesheet->status !== 'Pending' && !Auth::user()->hasRole(['admin', 'manager'])) {
             return Redirect::back()->with('error', 'Cannot update timesheet that is not pending.');
        }

        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'entry_date' => 'required|date|before_or_equal:today',
            'hours_worked' => 'required|numeric|min:0.01|max:24',
            'hourly_rate' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            // Admin/Manager bisa mengubah status
            'status' => Auth::user()->hasAnyRole(['admin', 'manager'])
                        ? ['nullable', Rule::in(['Pending', 'Approved', 'Rejected', 'Billed'])]
                        : [],
        ]);

        $task = Task::findOrFail($validated['task_id']);
        $updateData = [
            'task_id' => $task->id,
            'project_id' => $task->project_id,
            'entry_date' => $validated['entry_date'],
            'hours_worked' => $validated['hours_worked'],
            'hourly_rate' => $validated['hourly_rate'] ?? $timesheet->hourly_rate, // Jaga rate lama jika tidak diisi baru
            'description' => $validated['description'],
        ];

        // Hanya admin/manager yang bisa mengubah status secara langsung di form edit utama
        if (Auth::user()->hasAnyRole(['admin', 'manager']) && isset($validated['status'])) {
            $updateData['status'] = $validated['status'];
             if (in_array($validated['status'], ['Approved', 'Rejected']) && $timesheet->status !== $validated['status']) {
                $updateData['approved_by_user_id'] = Auth::id();
                $updateData['approved_at'] = Carbon::now();
            } elseif ($validated['status'] === 'Pending') {
                $updateData['approved_by_user_id'] = null;
                $updateData['approved_at'] = null;
            }
        }

        $timesheet->update($updateData);

        // Event TimesheetApproved akan ter-dispatch dari model jika status menjadi 'Approved'

        return Redirect::route('timesheets.index')->with('success', 'Timesheet updated successfully.');
    }

    public function destroy(Timesheet $timesheet)
    {
        $this->authorize('delete', $timesheet);

         if ($timesheet->status !== 'Pending' && !Auth::user()->hasRole(['admin', 'manager'])) {
             return Redirect::back()->with('error', 'Cannot delete timesheet that is not pending or you are not authorized.');
        }
        // Penting: Jika timesheet dihapus setelah disetujui, actual_cost perlu di-recalculate.
        // Ini bisa ditangani dengan event 'TimesheetDeleted' atau di sini.
        $wasApproved = $timesheet->status === 'Approved';
        $taskToUpdate = $timesheet->task;

        $timesheet->delete(); // Soft delete

        if ($wasApproved && $taskToUpdate) {
            // Recalculate actual cost for the task
            DB::transaction(function () use ($taskToUpdate) {
                $totalApprovedCostForTask = $taskToUpdate->timesheets()
                                                ->where('status', 'Approved')
                                                // ->whereNull('deleted_at') // Tidak perlu jika query default sudah menghandle softDeletes
                                                ->sum('cost');
                $taskToUpdate->actual_cost = $totalApprovedCostForTask;
                $taskToUpdate->saveQuietly();
                Log::info("Actual cost recalculated for task ID: {$taskToUpdate->id} after timesheet deletion.");
            });
        }

        return Redirect::route('timesheets.index')->with('success', 'Timesheet deleted successfully.');
    }

    // Metode untuk approval oleh Manager/Admin
    public function approve(Timesheet $timesheet)
    {
        $this->authorize('approve', $timesheet); // Kita akan buat Policy nanti

        if ($timesheet->status === 'Pending') {
            $timesheet->update([
                'status' => 'Approved',
                'approved_by_user_id' => Auth::id(),
                'approved_at' => Carbon::now(),
            ]);
             // Event akan ter-dispatch oleh model `updated` event
            return Redirect::back()->with('success', 'Timesheet approved.');
        }
        return Redirect::back()->with('error', 'Timesheet is not pending or already processed.');
    }

    public function reject(Request $request, Timesheet $timesheet) // Tambahkan Request untuk alasan reject
    {
        $this->authorize('reject', $timesheet); // Policy

        // Anda mungkin ingin menambahkan validasi untuk alasan reject
        // $request->validate(['rejection_reason' => 'required|string|max:255']);

        if ($timesheet->status === 'Pending' || $timesheet->status === 'Approved') { // Bisa reject yang sudah approved
            $wasApproved = $timesheet->status === 'Approved';
            $taskToUpdate = $timesheet->task;

            $timesheet->update([
                'status' => 'Rejected',
                'approved_by_user_id' => Auth::id(), // User yang mereject
                'approved_at' => Carbon::now(), // Waktu reject
                // 'rejection_reason' => $request->rejection_reason, // Simpan alasan jika ada fieldnya
            ]);

            // Jika yang direject sebelumnya adalah 'Approved', maka kurangi actual_cost
            if ($wasApproved && $taskToUpdate) {
                DB::transaction(function () use ($taskToUpdate) {
                    $totalApprovedCostForTask = $taskToUpdate->timesheets()
                                                    ->where('status', 'Approved')
                                                    ->sum('cost');
                    $taskToUpdate->actual_cost = $totalApprovedCostForTask;
                    $taskToUpdate->saveQuietly();
                    Log::info("Actual cost recalculated for task ID: {$taskToUpdate->id} after timesheet rejection.");
                });
            }
            return Redirect::back()->with('success', 'Timesheet rejected.');
        }
        return Redirect::back()->with('error', 'Timesheet cannot be rejected or already processed.');
    }
}
