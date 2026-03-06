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
        Schema::create('queue_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('queue_item_id')->constrained()->cascadeOnDelete();
            $table->string('strefa');
            $table->string('grupa_towarowa');
            $table->string('dostawca');
            $table->unsignedInteger('ilosc_nosnikow')->default(0);
            $table->unsignedInteger('ilosc_referencji')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_orders');
    }
};
