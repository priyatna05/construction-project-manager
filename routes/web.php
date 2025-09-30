<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SearchController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvmRecordController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\TimesheetController;
use App\Http\Controllers\Task\GroupController;
use App\Http\Controllers\Task\CommentController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\DropdownValuesController;
use App\Http\Controllers\Settings\LabelController;
use App\Http\Controllers\TaskDependencyController;
use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\MyWork\ActivityController;
use App\Http\Controllers\Task\AttachmentController;
use App\Http\Controllers\Client\ClientUserController;
use App\Http\Controllers\MyWork\MyWorkTaskController;
use App\Http\Controllers\Account\NotificationController;
use App\Http\Controllers\Client\ClientCompanyController;
use App\Http\Controllers\Invoice\InvoiceTasksController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\Settings\OwnerCompanyController;


Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return app(PublicProfileController::class)->index();
});

Route::get('/coming-soon', function () {abort(401);
})->name('coming.soon');
Route::post('/check-password', function (Request $request) {
    $request->validate(['password' => 'required']);

    return response()->json([
        'valid' => Hash::check($request->password, $request->user()->password),
    ]);
})->middleware('auth')->name('check.password');
// 1. Route yang akan dituju saat pengguna yang belum terverifikasi mencoba mengakses halaman yang dilindungi.
//    Ini akan menampilkan halaman "Tolong verifikasi email Anda".
Route::get('/email/verify', function () {
    return inertia('Auth/VerifyEmail'); // Pastikan Anda punya komponen React ini
})->middleware('auth')->name('verification.notice');

// 2. Route yang akan dituju saat pengguna mengklik link dari emailnya.
//    Laravel akan menangani validasi hash secara otomatis.
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill(); // Tandai email sebagai terverifikasi
    return redirect()->route('dashboard')->with('success', 'Email successfully verified!'); // Arahkan ke dashboard
})->middleware(['auth', 'signed'])->name('verification.verify');

// 3. Route untuk menangani permintaan "kirim ulang email verifikasi".
Route::post('/email/verification-notification', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return redirect()->route('dashboard');
    }
    $request->user()->sendEmailVerificationNotification();
    return back()->with('status', 'verification-link-sent'); // Kirim status kembali ke frontend
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

Route::group(['middleware' => ['auth:sanctum', 'verified']], function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('search', [\App\Http\Controllers\SearchController::class, 'search'])->name('search');

    // Projects
    Route::resource('projects', ProjectController::class)->except(['show']);
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.detail');
    Route::get('projects/{project}/download-pdf', [ProjectController::class, 'downloadPdf'])->name('projects.downloadPdf');
    Route::delete('projects/{project}/force-delete', [ProjectController::class, 'forceDelete'])->name('projects.forceDelete');
    Route::get('projects/{project}/export-excel', [ProjectController::class, 'exportExcel'])->name('projects.exportExcel');
    // PROJECT + earned
    Route::group(['prefix' => 'projects', 'as' => 'projects.'], function () {
        Route::delete('{projectId}/delete', [ProjectController::class, 'destroy'])->name('delete');
        Route::post('{projectId}/restore', [ProjectController::class, 'restore'])->name('restore');
        Route::put('{project}/favorite/toggle', [ProjectController::class, 'favoriteToggle'])->name('favorite.toggle');
        Route::post('{project}/user-access', [ProjectController::class, 'userAccess'])->name('user_access');

        // TASK GROUPS
        Route::post('{project}/task-groups', [GroupController::class, 'store'])->name('task-groups.store');
        Route::put('{project}/task-groups/{taskGroup}', [GroupController::class, 'update'])->name('task-groups.update')->scopeBindings();
        Route::delete('{project}/task-groups/{taskGroup}', [GroupController::class, 'destroy'])->name('task-groups.destroy')->scopeBindings();
        Route::delete('{project}/task-groups/{taskGroup}/force-delete', [GroupController::class, 'forceDelete'])->name('task-groups.forceDelete')->scopeBindings();
        Route::post('{project}/task-groups/{taskGroupId}/restore', [GroupController::class, 'restore'])->name('task-groups.restore')->scopeBindings();
        Route::post('{project}/task-groups/reorder', [GroupController::class, 'reorder'])->name('task-groups.reorder');

        // TASKS
        Route::get('{project}/tasks', [TaskController::class, 'index'])->name('tasks');
        Route::post('{project}/tasks', [TaskController::class, 'store'])->name('tasks.store');
        Route::patch('{project}/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update')->scopeBindings();
        Route::get('{project}/tasks/{task}/open', [TaskController::class, 'index'])->name('tasks.open')->scopeBindings();
        Route::delete('{project}/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy')->scopeBindings();
        Route::post('{project}/tasks/{task}/restore', [TaskController::class, 'restore'])->name('tasks.restore')->scopeBindings();

        Route::post('{project}/tasks/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete')->scopeBindings();
        Route::post('{project}/tasks/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');
        Route::post('{project}/tasks/move', [TaskController::class, 'move'])->name('tasks.move');

        // TASK DEPENDENCIES
        Route::group(['prefix' => '{project}/tasks/{task}/dependencies', 'as' => 'tasks.dependencies.'], function () {
            Route::get('/', [TaskDependencyController::class, 'index'])->name('index');
            Route::post('/', [TaskDependencyController::class, 'store'])->name('store');
            Route::delete('/{dependencyId}', [TaskDependencyController::class, 'destroy'])->name('destroy');
        });

        // INVENTORIES
        Route::group(['prefix' => '{project}/inventories', 'as' => 'projects.inventories.'], function () {
            Route::get('/', [InventoryController::class, 'projectInventories'])->name('index');
            Route::post('/{inventory}/tasks/{task}/allocate', [InventoryController::class, 'allocate'])->name('allocate');
        })->scopeBindings();

        // ATTACHMENTS
        Route::group(['prefix' => '{project}/tasks/{task}', 'as' => 'tasks.'], function () {
            Route::post('attachments/upload', [AttachmentController::class, 'store'])->name('attachments.upload');
            Route::delete('attachments/{attachment}', [AttachmentController::class, 'destroy'])->name('attachments.destroy');
        })->scopeBindings();

        // TIMESHEETS adding some EvM Analitics
        Route::group(['prefix' => '{project}/tasks/{task}', 'as' => 'tasks.'], function () {
            Route::post('timesheets/{timesheet}/approve', [TimesheetController::class, 'approve'])->name('timesheets.approve');
            Route::post('timesheets/{timesheet}/reject', [TimesheetController::class, 'reject'])->name('timesheets.reject');
            // Route::post('time-log', [TimeLogController::class, 'store'])->name('time-logs.store');
            // Route::delete('time-log/{timeLog}', [TimeLogController::class, 'destroy'])->name('time-logs.destroy');
            // Route::post('time-log/timer/start', [TimeLogController::class, 'startTimer'])->name('time-logs.timer.start');
            // Route::post('time-log/{timeLog}/timer/stop', [TimeLogController::class, 'stopTimer'])->name('time-logs.timer.stop');
        })->scopeBindings();

        // COMMENTS
        Route::group(['prefix' => '{project}/tasks/{task}', 'as' => 'tasks.'], function () {
            Route::get('comment', [CommentController::class, 'index'])->name('comments');
            Route::post('comment', [CommentController::class, 'store'])->name('comments.store');
        })->scopeBindings();
    });

    // Global Inventories
Route::group(['prefix' => 'inventories', 'as' => 'inventories.'], function () {
    Route::get('/', [InventoryController::class, 'index'])->name('index');
    Route::post('/', [InventoryController::class, 'store'])->name('store');
    Route::get('/{inventory}', [InventoryController::class, 'show'])->name('show');
    Route::put('/{inventory}', [InventoryController::class, 'update'])->name('update');
    Route::delete('/{inventory}', [InventoryController::class, 'destroy'])->name('destroy');
    Route::delete('{inventory}/force-delete', [InventoryController::class, 'forceDelete'])->name('forceDelete');
    Route::post('/{inventory}/restore', [InventoryController::class, 'restore'])->name('restore');
})->scopeBindings();

    // need adjustment better
    Route::post('Evm-record', [EvmRecordController::class, 'store'])->name('Evm-record.store');
    Route::post('Evm-record', [EvmRecordController::class, 'show'])->name('show');
    Route::post('Evm-record', [EvmRecordController::class, 'update'])->name('update');


    // My Work
    Route::group(['prefix' => 'my-work', 'as' => 'my-work.'], function () {
        Route::get('tasks', [MyWorkTaskController::class, 'index'])->name('tasks.index');
        Route::get('activity', [ActivityController::class, 'index'])->name('activity.index');
    });

    // Clients
    Route::group(['prefix' => 'clients', 'as' => 'clients.'], function () {
        Route::resource('users', ClientUserController::class)->except(['show']);
        Route::delete('users/{user}/force-delete', [ClientUserController::class, 'forceDelete'])->name('users.forceDelete');
        Route::post('users/{userId}/restore', [ClientUserController::class, 'restore'])->name('users.restore');

        Route::resource('companies', ClientCompanyController::class)->except(['show']);
        Route::delete('companies/{company}/force-delete', [ClientCompanyController::class, 'forceDelete'])->name('companies.forceDelete');
        Route::post('companies/{companyId}/restore', [ClientCompanyController::class, 'restore'])->name('companies.restore');
    });

    // Users
    Route::resource('users', UserController::class)->except(['show']);
    Route::delete('users/{user}/force-delete', [UserController::class, 'forceDelete'])->name('users.forceDelete');
    Route::post('users/{userId}/restore', [UserController::class, 'restore'])->name('users.restore');

    // Invoices
    Route::resource('invoices', InvoiceController::class)->except(['show']);
    Route::group(['prefix' => 'invoices', 'as' => 'invoices.'], function () {
        Route::get('tasks', [InvoiceTasksController::class, 'index'])->name('tasks');
        Route::put('{invoice}/status', [InvoiceController::class, 'setStatus'])->name('status');
        Route::post('{invoice}/restore', [InvoiceController::class, 'restore'])->name('restore');
        Route::get('{invoice}/download', [InvoiceController::class, 'download'])->name('download');
        Route::get('{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('pdf');
    });

    // Reports
    Route::group(['prefix' => 'reports', 'as' => 'reports.'], function () {
        Route::get('logged-time/sum', [ReportController::class, 'loggedTimeSum'])->name('logged-time.sum');
        Route::get('logged-time/daily', [ReportController::class, 'dailyLoggedTime'])->name('logged-time.daily');
        // for resoruces endpoint here

    });

    // Settings
    Route::group(['prefix' => 'settings', 'as' => 'settings.'], function () {
        Route::get('company', [OwnerCompanyController::class, 'edit'])->name('company.edit');
        Route::put('company', [OwnerCompanyController::class, 'update'])->name('company.update');

        Route::resource('roles', RoleController::class)->except(['show']);
        Route::delete('roles/{role}/force-delete', [RoleController::class, 'forceDelete'])->name('roles.forceDelete');
        Route::post('roles/{roleId}/restore', [RoleController::class, 'restore'])->name('roles.restore');

        Route::resource('labels', LabelController::class)->except(['show']);
        Route::delete('labels/{label}/force-delete', [LabelController::class, 'forceDelete'])->name('labels.forceDelete');
        Route::post('labels/{labelId}/restore', [LabelController::class, 'restore'])->name('labels.restore');
    });

    // Account
    Route::group(['prefix' => 'account', 'as' => 'account.'], function () {
        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    });

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::put('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::put('notifications/read/all', [NotificationController::class, 'readAll'])->name('notifications.read.all');

    Route::get('dropdown/values', DropdownValuesController::class)->name('dropdown.values');
});
