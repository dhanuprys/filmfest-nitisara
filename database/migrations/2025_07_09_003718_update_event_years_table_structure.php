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
            $table->string('title')->after('year');
            $table->text('description')->nullable()->after('title');
            $table->date('start_date')->after('description');
            $table->date('end_date')->after('start_date');
            $table->boolean('is_active')->default(true)->after('submission_end_date');

            // Rename existing columns to match controller expectations
            $table->renameColumn('registration_start_date', 'registration_start');
            $table->renameColumn('registration_end_date', 'registration_end');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_years', function (Blueprint $table) {
            $table->dropColumn(['title', 'description', 'start_date', 'end_date', 'is_active']);

            // Rename columns back
            $table->renameColumn('registration_start', 'registration_start_date');
            $table->renameColumn('registration_end', 'registration_end_date');
        });
    }
};
