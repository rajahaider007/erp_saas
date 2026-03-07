<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->string('storage_filename'); // filename on disk (voucher-attachments/)
            $table->string('original_name')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('mime_type', 100)->nullable();
            $table->timestamps();

            $table->foreign('comp_id')->references('id')->on('companies')->onDelete('cascade');
            $table->index(['comp_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_files');
    }
};
