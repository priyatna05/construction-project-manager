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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email',125)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->string('phone')->nullable();
            $table->string('job_title')->nullable();
            $table->decimal('default_hourly_rate', 10, 2)->nullable();
            $table->string('address')->nullable();
            $table->string('google_id')->nullable();
            $table->rememberToken();
            $table->timestamps();
           // Assuming 'archivedAt' is a custom macro you've defined, e.g., in AppServiceProvider
            $table->timestamp('archived_at')->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
