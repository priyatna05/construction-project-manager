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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id');
            $table->foreignId('group_id');
            $table->foreignId('created_by_user_id')->nullable();
            $table->foreignId('assigned_to_user_id')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->unsignedInteger('number');
            $table->unsignedInteger('order_column');
            $table->string('name_task');
            $table->text('description_task')->nullable();
            $table->date('start_date_task')->nullable();
            $table->date('end_date_task')->nullable();
            $table->unsignedInteger('budget_task')->nullable();
            $table->unsignedInteger('weight_task')->nullable();
            $table->unsignedInteger('progress_task')->default(0);
            $table->archivedAt();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
