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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->string('name_inventory');
            $table->string('code_inventory')->unique();
            $table->string('type');
            $table->text('description_inventory')->nullable();
            $table->string('unit')->nullable();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->onDelete('cascade');
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('sum_cost', 15, 2)->default(0);
            $table->string('status')->nullable();
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
