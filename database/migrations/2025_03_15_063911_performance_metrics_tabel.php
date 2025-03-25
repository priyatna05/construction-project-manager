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
        // cost_variance	schedule_variance	cost_performance_index	schedule_performance_index	estimate_to_complete	estimate_at_completion	estimete_temporary_schedule	estimate_all_schedule	time_estimate_at_completion	variance_at_completion	created_at	
    Schema::create('performance_matrics', function (Blueprint $table) {
        $table->id();
        $table->foreignId('task_id')->constrained()->onDelete('cascade');
        $table->float('plan_value');
        $table->float('earned_value');
        $table->float('actual_cost');
        $table->float('bac');
        $table->float('cost_variance');
        $table->float('schedule_variance');
        $table->float('cost_performance_index');
        $table->float('schedule_performance_index');
        $table->float('estimate_to_complete');
        $table->float('estimate_at_completion');
        $table->float('estimete_temporary_schedule');
        $table->float('estimate_all_schedule');
        $table->float('time_estimate_at_completion');
        $table->float('variance_at_completion');
        $table->timestamp('created_at');
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('performance_matrics');
    }
};
