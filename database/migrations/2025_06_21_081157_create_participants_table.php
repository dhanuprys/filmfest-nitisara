
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_year_id')->constrained('event_years')->onDelete('cascade');
            $table->integer('pin')->unique();
            $table->string('team_name', 100);
            $table->string('city', 100);
            $table->string('company', 100);
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('leader_name', 100);
            $table->string('leader_email', 100);
            $table->string('leader_whatsapp', 20);
            $table->string('student_card_file');
            $table->string('payment_evidence_file');
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
