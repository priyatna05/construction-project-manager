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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            // Ensure 'client_companies' table exists
            $table->foreignId('client_company_id')->constrained('client_companies')->onDelete('cascade'); // Or restrict/set null
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('budget_project', 15, 2)->unsigned()->nullable();
            $table->decimal('progress_project', 5, 2)->unsigned()->default(0); // Progress as percentage (e.g., 0.00 to 100.00 or 0.00 to 1.00)
            $table->timestamps();
            // Assuming 'archivedAt' is a custom macro
            // If not: $table->timestamp('archived_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->softDeletes();
        });

        Schema::create('project_user_access', function (Blueprint $table) {
            // Ensure 'users' and 'projects' tables exist
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->primary(['user_id', 'project_id']); // Added primary key
            // You might add access level/role here specific to this project
            // $table->string('access_level')->default('member');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_user_access');
        Schema::dropIfExists('projects');
    }
};
