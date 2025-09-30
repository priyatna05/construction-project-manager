<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evm_records', function (Blueprint $table) {
            $table->id();
            // Ensure 'projects' table exists
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->date('report_date'); // Date of the EVM snapshot

            // Budget At Completion (BAC) for this reporting period (usually project total budget_project)
            $table->decimal('budget_at_completion', 15, 2)->nullable();

            // Core EVM Values
            $table->decimal('planned_value', 15, 2)->nullable();      // PV or BCWS
            $table->decimal('earned_value', 15, 2)->nullable();       // EV or BCWP
            $table->decimal('actual_cost', 15, 2)->nullable();        // AC or ACWP

            // Variances
            $table->decimal('schedule_variance', 15, 2)->nullable();  // SV = EV - PV
            $table->decimal('cost_variance', 15, 2)->nullable();      // CV = EV - AC

            // Performance Indices
            $table->decimal('schedule_performance_index', 8, 4)->nullable(); // SPI = EV / PV
            $table->decimal('cost_performance_index', 8, 4)->nullable();     // CPI = EV / AC

            // Forecasts
            $table->decimal('estimate_at_completion', 15, 2)->nullable(); // EAC
            $table->decimal('estimate_to_complete', 15, 2)->nullable();   // ETC = EAC - AC
            $table->decimal('variance_at_completion', 15, 2)->nullable(); // VAC = BAC - EAC

            // To-Complete Performance Index (TCPI) based on BAC
            $table->decimal('tcpi_bac', 8, 4)->nullable(); // (BAC - EV) / (BAC - AC)
            // To-Complete Performance Index (TCPI) based on EAC
            $table->decimal('tcpi_eac', 8, 4)->nullable(); // (BAC - EV) / (EAC - AC)

            // $table->string('varianceToComplete')->nullable(); // Removed, as ETC and VAC cover this concept

            $table->text('notes')->nullable(); // Any notes specific to this EVM report
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'report_date']);
            $table->unique(['project_id', 'report_date'], 'project_report_date_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evm_records');
    }
};
