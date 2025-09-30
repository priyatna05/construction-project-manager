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
        Schema::create('client_companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->nullable()->constrained('countries')->onDelete('set null');
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->onDelete('set null');
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('city')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('web')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });

        Schema::create('client_company_user', function (Blueprint $table) {
            // Ensure 'users' table exists
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('client_company_id')->constrained('client_companies')->onDelete('cascade');
            $table->primary(['user_id', 'client_company_id']); // Added primary key
            // You might add a 'role' string here if a user has a specific role within that client company contact
            // $table->string('contact_role')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_company_user');
        Schema::dropIfExists('client_companies');
    }
};
