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
        Schema::create('task_groups', function (Blueprint $table) {
            $table->id();
            // Ensure 'projects' table exists
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable(); // acumulate date tasks and task dependents
            $table->date('end_date')->nullable();
            $table->decimal('budget_group', 15, 2)->unsigned()->nullable(); // Use decimal
            $table->decimal('weight_group', 5, 2)->unsigned()->nullable(); // e.g., weight in overall project, sum to 1 or 100
            $table->decimal('progress_group', 5, 2)->unsigned()->default(0); // Progress as percentage
            $table->unsignedInteger('order_column')->default(0);
            // Assuming 'archivedAt' is a custom macro
            // If not: $table->timestamp('archived_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_groups');
    }
};
