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
        Schema::create('work_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name')->nullable();
            $table->date('report_date');
            $table->unsignedTinyInteger('progress')->default(0); // 0-100
            $table->decimal('work_done', 15, 3)->unsigned()->nullable();
            $table->foreignId('unit_id')->nullable()->constrained('labels')->onDelete('set null');
            $table->decimal('actual_cost', 15, 2)->unsigned()->default(0);
            $table->decimal('actual_unit_cost', 15, 2)->nullable();
            $table->json('labor_details')->nullable();
            $table->json('material_details')->nullable();
            $table->json('equipment_details')->nullable();
            $table->text('remarks')->nullable();
            $table->string('weather')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['task_id', 'report_date']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_reports');
    }
};
