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
            $table->string('event_guide_document')->nullable()->after('show_end');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_years', function (Blueprint $table) {
            $table->dropColumn('event_guide_document');
        });
    }
};
