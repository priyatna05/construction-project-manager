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
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->string('code_inventory')->unique();
            $table->string('name_inventory');
            $table->text('description_inventory')->nullable();
            $table->string('status');
            $table->string('type');
            $table->string('unit')->nullable();
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('quantity_inventory')->nullable();
            $table->unsignedBigInteger('location_inventory')->nullable()->references('id')->on('projects')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
