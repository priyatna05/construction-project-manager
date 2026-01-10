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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_company_id')
                ->nullable()
                ->constrained('client_companies')
                ->nullOnDelete();
            $table->foreignId('client_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            // 🔹 BUDGET & COST STRUCTURE

            // Total biaya langsung (labor, material, equipment)
            $table->decimal('direct_cost_plan', 15, 2)->default(0);
            $table->decimal('direct_cost_actual', 15, 2)->default(0);

            // Overhead site cost: bisa persentase dari direct_cost atau nominal
            $table->decimal('overhead_site_rate', 5, 2)->default(0); // misal: 10 (%)
            $table->decimal('overhead_site_cost_plan', 15, 2)->default(0);
            $table->decimal('overhead_site_cost_actual', 15, 2)->default(0);

            // Administrative cost
            $table->decimal('administrative_rate', 5, 2)->default(0); // misal: 5 (%)
            $table->decimal('administrative_cost_plan', 15, 2)->default(0);
            $table->decimal('administrative_cost_actual', 15, 2)->default(0);


            // Contingency reserve
            $table->decimal('contingency_rate', 5, 2)->default(0); // misal: 3 (%)
            $table->decimal('contingency_cost_plan', 15, 2)->default(0);
            $table->decimal('contingency_cost_actual', 15, 2)->default(0);

            // Profit (Keuntungan kontraktor)
            $table->decimal('profit_rate', 5, 2)->default(0); // contoh: 8%
            $table->decimal('profit_cost_plan', 15, 2)->default(0);
            $table->decimal('profit_cost_actual', 15, 2)->default(0);

            // Tax (PPN / pajak proyek)
            $table->decimal('tax_rate', 5, 2)->default(0); // contoh: 11%
            $table->decimal('tax_cost_plan', 15, 2)->default(0);
            $table->decimal('tax_cost_actual', 15, 2)->default(0);

            //     // Total budget (sum dari semua komponen di atas)
            $table->decimal('budget_project_estimate', 15, 2)->unsigned()->nullable(); // nilai awal dari kontrak
            $table->decimal('budget_project_final_plan', 15, 2)->default(0);
            $table->decimal('budget_project_actual', 15, 2)->unsigned()->nullable(); // realisasi (actual cost)


            // Grand total (nilai akhir kontrak)
            $table->decimal('budget_project_grandtotal_plan', 15, 2)->unsigned()->nullable();
            $table->decimal('budget_project_grandtotal_actual', 15, 2)->unsigned()->nullable();

            //     // 🔹 PROJECT PERFORMANCE
            //     // =======================
            $table->decimal('progress_project', 5, 2)->unsigned()->default(0);  // 0–100%
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('project_user_access', function (Blueprint $table) {
            // Ensure 'users' and 'projects' tables exist
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->primary(['user_id', 'project_id']);
            // You might add access level/role here specific to this project
            // $table->string('access_level')->default('member');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_user_access');
        Schema::dropIfExists('projects');
    }
};
