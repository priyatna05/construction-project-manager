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
        Schema::create('labelables', function (Blueprint $table) {
            $table->foreignId('label_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('labelable_id');
            $table->string('labelable_type');
            $table->string('type')->nullable();
            $table->primary(['label_id', 'labelable_id', 'labelable_type']);
            $table->index(['labelable_id', 'labelable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('labelables');
    }
};
