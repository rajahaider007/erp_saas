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
        Schema::table('code_configurations', function (Blueprint $table) {
            // Make fields nullable since they're no longer required in the form
            $table->string('code_name', 100)->nullable()->change();
            $table->integer('account_level')->nullable()->change();
            $table->string('prefix', 10)->nullable()->change();
            $table->integer('next_number')->nullable()->change();
            $table->integer('number_length')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('code_configurations', function (Blueprint $table) {
            $table->string('code_name', 100)->nullable(false)->change();
            $table->integer('account_level')->default(2)->nullable(false)->change();
            $table->string('prefix', 10)->nullable()->change();
            $table->integer('next_number')->default(1)->nullable(false)->change();
            $table->integer('number_length')->default(4)->nullable(false)->change();
        });
    }
};

