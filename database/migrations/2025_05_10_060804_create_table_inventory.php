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
            // $table->decimal('total_value', 15, 2)->nullable(); // unit_cost * quantity_on_hand - BEST TO CALCULATE THIS IN MODEL

            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null');

            // Location can be a generic string or linked to a specific entity (e.g., warehouse, project site)
            // If linked to project site:
            $table->foreignId('project_site_location_id')->nullable()->constrained('projects')->onDelete('set null');
            // Or a generic text field: $table->string('location_description')->nullable();

            // Removed task_id, quantity_allocation, allocated_date from here.
            // These should be in a separate 'inventory_allocations' or 'material_issue_slips' table.
            // See suggestion below.

            // Assuming 'archivedAt' is a custom macro
            // If not: $table->timestamp('archived_at')->nullable();
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
            $table->decimal('quantity_allocated', 15, 4);
            $table->decimal('cost_at_allocation', 15, 2); // quantity_allocated * inventory.unit_cost at time of allocation
            $table->date('allocation_date');
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
