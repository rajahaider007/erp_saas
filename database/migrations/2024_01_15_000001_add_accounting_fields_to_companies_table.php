<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAccountingFieldsToCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->boolean('accounting_vno_auto')->default(true)->after('status');
            $table->string('base_currency', 3)->default('USD')->after('accounting_vno_auto');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['accounting_vno_auto', 'base_currency']);
        });
    }
}
