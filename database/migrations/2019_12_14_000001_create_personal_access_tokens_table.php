<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tokenable_id');
            $table->string('tokenable_type', 191)->charset('utf8mb4'); // Limit to 191 characters
            $table->text('name');
            $table->text('token');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            // Create a prefix index for the first 191 characters of 'tokenable_type'
            $table->index(['tokenable_type', 'tokenable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
