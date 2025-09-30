<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void // Corrected to up(): void
    {
        // Ensure config('favorite.favorites_table') and config('favorite.user_foreign_key') are set
        $tableName = config('favorite.favorites_table', 'favorites'); // Default to 'favorites'
        $userForeignKey = config('favorite.user_foreign_key', 'user_id'); // Default to 'user_id'

        Schema::create($tableName, function (Blueprint $table) use ($userForeignKey) {
            $table->id();
            // Ensure 'users' table exists and user_id is of the correct type
            $table->foreignId($userForeignKey)->constrained('users')->onDelete('cascade');
            $table->morphs('favoriteable'); // Creates favoriteable_id (unsignedBigInteger) and favoriteable_type (string)
            $table->timestamps();

            // Unique constraint to prevent duplicate favorites by the same user for the same item
            $table->unique([$userForeignKey, 'favoriteable_id', 'favoriteable_type'], 'user_favorite_unique');
            // Index for favoriteable is automatically created by morphs()
        });
    }

    public function down(): void // Corrected to down(): void
    {
        $tableName = config('favorite.favorites_table', 'favorites');
        Schema::dropIfExists($tableName);
    }
};
