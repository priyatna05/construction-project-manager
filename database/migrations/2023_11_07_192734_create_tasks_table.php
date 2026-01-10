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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            // Ensure 'projects' and 'task_groups' tables exist
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('group_id')->constrained('task_groups')->onDelete('cascade'); // Renamed for clarity
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('assigned_at')->nullable();
            $table->unsignedInteger('number')->nullable(); // Task number, consider unique per project
            $table->unsignedInteger('order_column')->default(0);
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('budget_task_plan', 15, 2)->unsigned()->nullable();   // Rencana biaya untuk task
            $table->decimal('budget_task_actual', 15, 2)->unsigned()->nullable(); // Realisasi biaya task
            $table->decimal('weight_task', 8, 2)->default(0);
            $table->decimal('volume', 12, 3)->unsigned()->nullable(); // e.g., weight in overall group/project
            $table->decimal('unit_cost_task', 15, 2)->unsigned()->default(0); // Physical Percent Complete (0.00-1.00 or 0-100)
            $table->decimal('progress_task', 5, 2)->default(0);// 0-100
            // Assuming 'archivedAt' is a custom macro``
            // If not: $table->timestamp('archived_at')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['project_id', 'number']); // Optional: if number should be unique per project
            // $table->unique(['project_id', 'number']); // If strictly unique
        });

        Schema::create('task_dependencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('depends_on_task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('relation_type_id')->constrained('labels')->onDelete('restrict');
            $table->integer('lag_days')->default(0);
            $table->timestamps();
            $table->unique(['task_id', 'depends_on_task_id', 'relation_type_id'], 'task_dependency_unique');
        });

        Schema::create('task_user_subscriptions', function (Blueprint $table) { // Renamed for clarity
            // Ensure 'users' and 'tasks' tables exist
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->primary(['user_id', 'task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_user_subscriptions');
        Schema::dropIfExists('task_dependencies');
        Schema::dropIfExists('tasks');
    }
};
