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
