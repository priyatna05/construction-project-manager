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
        Schema::create('timesheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade'); // For easier project-level reporting

            $table->date('entry_date');
            $table->decimal('hours_worked', 5, 2);
            $table->decimal('hourly_rate', 15, 2)->nullable(); // Can be pre-filled from user profile or project role
            $table->decimal('cost', 15, 2); // hours_worked * hourly_rate (can be calculated on save)

            $table->text('description')->nullable();
            $table->string('status')->nullable();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timesheets');
    }
};
