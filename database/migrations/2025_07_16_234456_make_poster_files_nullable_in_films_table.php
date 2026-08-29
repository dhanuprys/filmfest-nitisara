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
            $table->string('poster_landscape_file')->nullable()->change();
            $table->string('poster_portrait_file')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('films', function (Blueprint $table) {
            $table->string('poster_landscape_file')->nullable(false)->change();
            $table->string('poster_portrait_file')->nullable(false)->change();
        });
    }
};
