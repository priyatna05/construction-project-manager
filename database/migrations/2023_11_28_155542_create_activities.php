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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            // Ensure 'projects' and 'users' tables exist
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('cascade'); // Activity might not always be project-specific
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // User who performed action

            $table->string('title'); // Short description, e.g., "Task Created", "Comment Added"
            $table->string('description')->nullable(); // Longer description or content of change

            // Polymorphic relation to the model that caused the activity
            // $table->foreignId('activity_capable_id'); // Replaced by morphs
            // $table->string('activity_capable_type')g; // Replaced by morphs
            $table->nullableMorphs('subject'); // E.g., Task, Comment, Project. Creates subject_id, subject_type

            // Optionally, store properties/changes as JSON
            $table->json('properties')->nullable();

            $table->timestamp('created_at')->useCurrent(); // Only created_at, no updated_at for activity log
            // $table->timestamps(); // Typically activity logs only have created_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
