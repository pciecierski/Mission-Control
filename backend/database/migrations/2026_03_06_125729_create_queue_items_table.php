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
        Schema::create('queue_items', function (Blueprint $table) {
            $table->id();
            $table->string('numer_awizacji');
            $table->enum('rodzaj', ['rozładunek', 'załadunek']);
            $table->string('magazyn');
            $table->string('kierowca');
            $table->string('numer_pojazdu');
            $table->date('planowana_data');
            $table->time('planowana_godzina')->nullable();
            $table->time('godzina_rozpoczecia')->nullable();
            $table->unsignedInteger('ilosc_zamowien')->default(0);
            $table->unsignedInteger('position')->default(0)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_items');
    }
};
