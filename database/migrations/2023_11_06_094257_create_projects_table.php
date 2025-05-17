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
            $table->unsignedBigInteger('client_company_id');
            $table->string('name_project');
            $table->text('description_project')->nullable();
            $table->date('start_date_project')->nullable();
            $table->date('end_date_project')->nullable();
            $table->unsignedInteger('budget_project')->nullable();
            $table->unsignedInteger('progress_project')->default(0);
            $table->timestamps();
            $table->archivedAt();
            $table->softDeletes();

            $table->foreign('client_company_id')->references('id')->on('client_companies');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
