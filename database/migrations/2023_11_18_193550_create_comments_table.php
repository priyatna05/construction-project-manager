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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            // Ensure 'users' and 'tasks' tables exist
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Or set null
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
            $table->softDeletes(); // Good to allow soft deleting comments
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
