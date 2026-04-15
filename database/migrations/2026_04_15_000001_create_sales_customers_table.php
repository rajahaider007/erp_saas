<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comp_id')->constrained('companies');
            $table->foreignId('location_id')->constrained('locations');
            $table->string('customer_code')->unique();
            $table->string('customer_name');
            $table->enum('customer_type', ['retail', 'wholesale', 'distributor'])->default('retail');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();
            $table->foreignId('currency_id')->constrained('currencies');
            $table->integer('payment_terms')->default(30); // days
            $table->decimal('credit_limit', 14, 2)->default(0);
            $table->decimal('warning_percentage', 5, 2)->default(80);
            $table->date('customer_since')->nullable();
            $table->boolean('active_status')->default(true);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('comp_id');
            $table->index('customer_code');
            $table->index('active_status');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_customers');
    }
};
