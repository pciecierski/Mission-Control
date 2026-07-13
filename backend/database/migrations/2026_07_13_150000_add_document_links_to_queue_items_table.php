<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('queue_items', function (Blueprint $table) {
            $table->text('doc_upload_url')->nullable()->after('pobrana_at');
            $table->text('qr_code_url')->nullable()->after('doc_upload_url');
        });
    }

    public function down(): void
    {
        Schema::table('queue_items', function (Blueprint $table) {
            $table->dropColumn(['doc_upload_url', 'qr_code_url']);
        });
    }
};
