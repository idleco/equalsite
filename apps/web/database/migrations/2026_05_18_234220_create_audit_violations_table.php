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
        Schema::create('audit_violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_id');
            $table->string('rule_id');
            $table->string('impact_level');
            $table->text('plain_english_summary')->nullable(); // AI output
            $table->text('fix_instruction')->nullable(); // AI output
            $table->text('description');
            $table->text('failure_summary');
            $table->string('help_url');
            $table->json('nodes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_violations');
    }
};
