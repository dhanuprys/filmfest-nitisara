
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_years', function (Blueprint $table) {
            $table->id();
            $table->integer('year');
            $table->dateTime('registration_start_date');
            $table->dateTime('registration_end_date');
            $table->dateTime('submission_start_date');
            $table->dateTime('submission_end_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_years');
    }
};
