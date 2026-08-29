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
        Schema::table('event_years', function (Blueprint $table) {
            $table->dateTime('show_start')->nullable()->after('updated_at');
            $table->dateTime('show_end')->nullable()->after('show_start');
            $table->dropColumn('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_years', function (Blueprint $table) {
            $table->dropColumn(['show_start', 'show_end']);
            $table->boolean('is_active')->default(false);
        });
    }
};
