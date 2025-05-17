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
        Schema::create(config('favorite.favorites_table', 125), function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger(config('favorite.user_foreign_key'))->index()->comment('user_id');
            $table->string('favoriteable_type', 255)->charset('utf8'); // Use utf8 encoding
            $table->unsignedBigInteger('favoriteable_id');
            $table->timestamps();

            // Create the index for the polymorphic relationship
            $table->index(['favoriteable_type', 'favoriteable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists(config('favorite.favorites_table'));
    }
};
