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
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('unit_cost', 15, 2)->unsigned()->default(0);
            $table->decimal('quantity_on_hand', 15, 2)->default(0);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('archived_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // Suggested new table for tracking allocations to tasks
        Schema::create('inventory_task_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained('inventories')->onDelete('cascade');
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('allocated_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('quantity_allocated', 15, 2);
            $table->decimal('cost_at_allocation', 15, 2); // quantity_allocated * inventory.unit_cost at time of allocation
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_task_allocations');
        Schema::dropIfExists('inventories');
    }
};
