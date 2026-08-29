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
        Schema::create('voting_page_pins', function (Blueprint $table) {
            $table->id();
            $table->string('pin', 6)->unique();
            $table->string('name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('lifetime_minutes')->default(1440); // Default 24 hours (1440 minutes)
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voting_page_pins');
    }
};
