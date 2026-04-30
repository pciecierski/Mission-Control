<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('queue_items', function (Blueprint $table) {
            $table->string('pobrana_przez_identyfikator')->nullable()->after('status');
            $table->string('pobrana_przez_inicjaly', 8)->nullable()->after('pobrana_przez_identyfikator');
            $table->timestamp('pobrana_at')->nullable()->after('pobrana_przez_inicjaly');
        });
    }

    public function down(): void
    {
        Schema::table('queue_items', function (Blueprint $table) {
            $table->dropColumn(['pobrana_przez_identyfikator', 'pobrana_przez_inicjaly', 'pobrana_at']);
        });
    }
};
