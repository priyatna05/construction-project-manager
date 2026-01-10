<?php

use App\Events\Analytic\EvmRecordUpdated;
use App\Models\EvmRecord;
use App\Models\Project;
use App\Models\Task;
use App\Services\EvmCalculationService;
use App\Services\EvmRecordService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Notifications\Notifiable;

uses(Tests\TestCase::class)->group('evm');

uses()->afterEach(function () {
    Mockery::close();
    Carbon::setTestNow();
});

function makeStubbedRecordService(array $metrics, EvmRecord $record): EvmRecordService
{
    $calculatorMock = Mockery::mock(EvmCalculationService::class);
    $calculatorMock->shouldReceive('calculateMetrics')->andReturn($metrics);

    $resolver = function (int $projectId, Carbon $recordDate) use ($record) {
        // Simulasikan pencarian record yang sama untuk tanggal yang sama
        $record->project_id = $projectId;
        $record->report_date = $recordDate;
        return $record;
    };

    return new EvmRecordService($calculatorMock, $resolver);
}

test('W1 semua task dengan progres menghasilkan PV, EV, dan AC gabungan yang benar', function () {
    $service = new EvmCalculationService();

    $project = new Project([
        'id' => 1,
        'budget_project_final_plan' => 2000,
    ]);

    $asOfDate = Carbon::parse('2025-01-03');

    $tasks = new EloquentCollection([
        new Task([
            'start_date' => '2025-01-01',
            'end_date' => '2025-01-03',
            'weight_task' => 1,
            'progress_task' => 50,
            'actual_cost' => 400,
        ]),
        new Task([
            'start_date' => '2025-01-01',
            'end_date' => '2025-01-03',
            'weight_task' => 1,
            'progress_task' => 75,
            'actual_cost' => 600,
        ]),
    ]);

    $metrics = $service->calculateProjectCoreMetrics($project, $asOfDate, $tasks);

    expect($metrics['pv'])->toBe(2000.0)
        ->and($metrics['ev'])->toBe(1250.0)
        ->and($metrics['ac'])->toBe(1000.0);
});

test('W2 task dengan progres 0 tetap dihitung di PV tapi tidak di EV', function () {
    $service = new EvmCalculationService();

    $project = new Project([
        'id' => 1,
        'budget_project_final_plan' => 1000,
    ]);

    $asOfDate = Carbon::parse('2025-01-03');

    $tasks = new EloquentCollection([
        new Task([
            'start_date' => '2025-01-01',
            'end_date' => '2025-01-03',
            'weight_task' => 1,
            'progress_task' => 0,
            'actual_cost' => 0,
        ]),
        new Task([
            'start_date' => '2025-01-01',
            'end_date' => '2025-01-03',
            'weight_task' => 1,
            'progress_task' => 50,
            'actual_cost' => 100,
        ]),
    ]);

    $metrics = $service->calculateProjectCoreMetrics($project, $asOfDate, $tasks);

    expect($metrics['pv'])->toBe(1000.0)
        ->and($metrics['ev'])->toBe(250.0)
        ->and($metrics['ac'])->toBe(100.0);
});

test('W3 CPI tidak dihitung saat AC 0 dan CV tetap sesuai EV', function () {
    $service = new EvmCalculationService();

    $derived = $service->calculateProjectDerivedMetrics(
        pv: 120.0,
        ev: 75.0,
        ac: 0.0,
        bac: 500.0,
    );

    expect($derived['cv'])->toBe(75.0)
        ->and($derived['cpi'])->toBeNull()
        ->and($derived['eac'])->toBeNull()
        ->and($derived['vac'])->toBeNull();
});

test('W4 PV nol sebelum proyek dimulai membuat SPI null dan SV nol', function () {
    $service = new EvmCalculationService();

    $project = new Project([
        'id' => 1,
        'budget_project_final_plan' => 500,
    ]);

    $asOfDate = Carbon::parse('2025-02-05');

    $tasks = new EloquentCollection([
        new Task([
            'start_date' => '2025-02-10',
            'end_date' => '2025-02-12',
            'weight_task' => 1,
            'progress_task' => 0,
            'actual_cost' => 0,
        ]),
    ]);

    $core = $service->calculateProjectCoreMetrics($project, $asOfDate, $tasks);
    $derived = $service->calculateProjectDerivedMetrics(
        $core['pv'],
        $core['ev'],
        $core['ac'],
        $core['bac'],
    );

    expect($core['pv'])->toBe(0.0)
        ->and($core['ev'])->toBe(0.0)
        ->and($derived['sv'])->toBe(0.0)
        ->and($derived['spi'])->toBeNull();
});

test('W5 EAC melebihi BAC menghasilkan VAC negatif', function () {
    $service = new EvmCalculationService();

    $derived = $service->calculateProjectDerivedMetrics(
        pv: 500.0,
        ev: 400.0,
        ac: 800.0,
        bac: 1000.0,
    );

    expect($derived['cpi'])->toBe(0.5)
        ->and($derived['eac'])->toBe(2000.0)
        ->and($derived['vac'])->toBe(-1000.0);
});

test('W6 laporan tanggal sama diperbarui bukan menambah baris baru', function () {
    config(['evm.notify_enabled' => false]);
    Event::fake();

    Carbon::setTestNow('2025-01-01 09:00:00');

    $project = new Project([
        'budget_project_final_plan' => 1000,
    ]);
    $project->id = 77;

    $record = Mockery::mock(EvmRecord::class)->makePartial();
    $record->id = 1;
    $record->exists = true;
    $record->shouldReceive('save')->twice()->andReturnTrue();

    $initialService = makeStubbedRecordService([
        'pv' => 100.0,
        'ev' => 90.0,
        'ac' => 80.0,
        'bac' => 500.0,
        'sv' => 10.0,
        'cv' => 10.0,
        'spi' => 0.9,
        'cpi' => 1.13,
        'eac' => 444.44,
        'etc' => 364.44,
        'vac' => 55.56,
    ], $record);

    $firstRecord = $initialService->calculateAndSave($project);

    expect((float) $firstRecord->planned_value)->toBe(100.0)
        ->and((float) $firstRecord->earned_value)->toBe(90.0);

    Carbon::setTestNow('2025-01-01 15:00:00');

    $updateService = makeStubbedRecordService([
        'pv' => 150.0,
        'ev' => 110.0,
        'ac' => 95.0,
        'bac' => 500.0,
        'sv' => -40.0,
        'cv' => 15.0,
        'spi' => 0.73,
        'cpi' => 1.16,
        'eac' => 431.03,
        'etc' => 336.03,
        'vac' => 68.97,
    ], $record);

    $updatedRecord = $updateService->calculateAndSave($project);

    expect($updatedRecord)->toBe($firstRecord)
        ->and((float) $updatedRecord->planned_value)->toBe(150.0)
        ->and((float) $updatedRecord->earned_value)->toBe(110.0);

    Event::assertDispatched(EvmRecordUpdated::class, 2);
});

test('EVM alert notification dikirim saat melewati ambang batas', function () {
    Notification::fake();
    Event::fake();
    config([
        'evm.notify_enabled' => true,
        'evm.email_enabled' => true,
        'evm.cpi_threshold' => 0.9,
        'evm.spi_threshold' => 0.9,
    ]);

    $project = new Project(['name' => 'Proyek A']);
    $project->id = 55;

    $record = Mockery::mock(EvmRecord::class)->makePartial();
    $record->id = 999;
    $record->exists = true;
    $record->shouldReceive('save')->once()->andReturnTrue();

    $notifiable = new class {
        use Notifiable;
        public $id = 123;
        public $email = 'pm@example.com';
        public function getKey() { return $this->id; }
    };

    $calculatorMock = Mockery::mock(EvmCalculationService::class);
    $calculatorMock->shouldReceive('calculateMetrics')->andReturn([
        'pv' => 100.0,
        'ev' => 60.0,
        'ac' => 120.0,
        'bac' => 100.0,
        'sv' => -40.0,
        'cv' => -60.0,
        'spi' => 0.6,
        'cpi' => 0.5,
        'eac' => 200.0,
        'etc' => 80.0,
        'vac' => -100.0,
    ]);

    $recordResolver = function (int $projectId, Carbon $recordDate) use ($record) {
        return $record;
    };

    $recipientResolver = fn () => collect([$notifiable]);

    $service = new EvmRecordService($calculatorMock, $recordResolver, $recipientResolver);

    $service->calculateAndSave($project);

    Notification::assertSentTo(
        [$notifiable],
        \App\Notifications\EvmRecordNotification::class,
        function ($notification, $channels) {
            $types = collect($notification->triggers)->pluck('type')->sort()->values()->all();
            return in_array('database', $channels)
                && in_array('mail', $channels)
                && $types === ['cpi', 'eac_over_bac', 'spi'];
        }
    );
});
