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
        Schema::table('films', function (Blueprint $table) {
            // Rename poster_file to poster_landscape_file if exists
            if (Schema::hasColumn('films', 'poster_file')) {
                $table->renameColumn('poster_file', 'poster_landscape_file');
            }
            // Add poster_portrait_file
            $table->string('poster_portrait_file')->nullable()->after('poster_landscape_file');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('films', function (Blueprint $table) {
            // Rename back if needed
            if (Schema::hasColumn('films', 'poster_landscape_file')) {
                $table->renameColumn('poster_landscape_file', 'poster_file');
            }
            // Drop poster_portrait_file
            if (Schema::hasColumn('films', 'poster_portrait_file')) {
                $table->dropColumn('poster_portrait_file');
            }
        });
    }
};
