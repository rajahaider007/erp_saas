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
        // Attempt to add the accounting columns only if the companies table
        // exists and the columns aren't already present. The creation migration
        // now includes these fields, so this migration becomes effectively a
        // no-op on fresh installs. Keeping the checks prevents "table not
        // found" errors when the timestamp order is wrong and avoids duplicate
        // column errors when running against an existing schema.
        if (Schema::hasTable('companies')) {
            Schema::table('companies', function (Blueprint $table) {
                if (!Schema::hasColumn('companies', 'accounting_vno_auto')) {
                    $table->boolean('accounting_vno_auto')->default(true)->after('status');
                }
                if (!Schema::hasColumn('companies', 'base_currency')) {
                    $table->string('base_currency', 3)->default('USD')->after('accounting_vno_auto');
                }
            });
        }
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
