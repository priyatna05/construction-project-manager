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
        Schema::create('evm_record', function (Blueprint $table) {
            $table->id();
            $table->string('plannedValue')->nullable();
            $table->string('earnedValue')->nullable();
            $table->string('actualCost')->nullable();
            $table->string('scheduleVariance')->nullable();
            $table->string('costVariance')->nullable();
            $table->string('schedulePerformanceIndex')->nullable();
            $table->string('costPerformanceIndex')->nullable();
            $table->string('estimateAtCompletion')->nullable();
            $table->string('estimateToComplete')->nullable();
            $table->string('varianceAtCompletion')->nullable();
            $table->string('varianceToComplete')->nullable();
            $table->timestamps();

            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evmcalculation');
    }
};
