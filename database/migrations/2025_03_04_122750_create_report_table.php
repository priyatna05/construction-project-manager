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
        Schema::create('report', function (Blueprint $table) {
           // Pluralized table name
            $table->id();
            $table->string('name');
            $table->text('description')->nullable(); // Changed to text for longer descriptions
            $table->string('file_path'); // Path to the stored report file
            $table->string('file_disk')->default('public'); // Filesystem disk
            $table->string('mime_type')->nullable();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // User who generated/uploaded
            $table->timestamps();
            $table->softDeletes(); // Good for reports
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports'); // Pluralized
    }
};
