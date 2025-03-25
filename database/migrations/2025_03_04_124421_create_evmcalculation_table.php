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
        Schema::create('evmcalculation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id');
            $table->string('plannedValue');
            $table->string('earnedValue');
            $table->string('actualCost');
            $table->string('scheduleVariance');
            $table->string('costVariance');
            $table->string('schedulePerformanceIndex');
            $table->string('costPerformanceIndex');
            $table->string('estimateAtCompletion');
            $table->string('estimateToComplete');
            $table->string('varianceAtCompletion');
            $table->string('varianceToComplete');
            $table->timestamps();
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
