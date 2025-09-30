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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            // Ensure 'client_companies' and 'users' tables exist
            $table->foreignId('client_company_id')->constrained('client_companies')->onDelete('restrict'); // Don't delete invoice if company exists
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('set null'); // Invoice might be for a specific project
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('restrict');

            $table->string('number')->unique(); // Invoice numbers are typically unique
            $table->string('status'); // e.g., 'Draft', 'Sent', 'Paid', 'Overdue', 'Void'
            $table->string('type')->nullable(); // e.g., 'Standard', 'Proforma', 'Credit Note'
            $table->text('note')->nullable(); // Internal notes
            $table->text('terms')->nullable(); // Payment terms for client

            $table->decimal('subtotal_amount', 15, 2)->unsigned();
            $table->decimal('tax_amount', 15, 2)->unsigned()->default(0);
            $table->decimal('total_amount', 15, 2)->unsigned(); // subtotal + tax
            // $table->unsignedInteger('hourly_rate')->nullable(); // If based on hours, better link to timesheets/invoice_items

            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->string('filename')->nullable(); // If a PDF is generated and stored
            // $table->timestamp('created_at')->nullable(); // `timestamps()` handles this
            // Assuming 'archivedAt' is a custom macro
            // If not: $table->timestamp('archived_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps(); // Includes created_at and updated_at
            $table->softDeletes();
        });

        // Optional: Invoice Items (if an invoice can have multiple line items)
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->foreignId('task_id')->nullable()->constrained('tasks')->onDelete('set null'); // Link item to a task
            $table->string('description');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2); // quantity * unit_price
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
    }
};
