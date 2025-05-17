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
        Schema::create('task_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id');
            $table->string('name_group');
            $table->text('description_group')->nullable();
            $table->date('start_date_group')->nullable();
            $table->date('end_date_group')->nullable();
            $table->unsignedInteger('budget_group')->nullable();
            $table->unsignedInteger('weight_group')->nullable();
            $table->unsignedInteger('progress_group')->default(0);
            $table->unsignedInteger('order_column');
            $table->archivedAt();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_groups');
    }
};
