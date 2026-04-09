<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_compliance_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('code_kind', 20);
            $table->string('code', 20);
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id', 'code_kind']);
            $table->unique(['company_id', 'code_kind', 'code', 'deleted_at'], 'inv_compliance_codes_unique_active');
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_items', 'package_type_id')) {
                $table->foreignId('package_type_id')->nullable()->constrained('inventory_package_types')->nullOnDelete();
            }
            if (! Schema::hasColumn('inventory_items', 'inventory_temperature_class_id')) {
                $table->foreignId('inventory_temperature_class_id')->nullable()->constrained('inventory_temperature_classes')->nullOnDelete();
            }
            if (! Schema::hasColumn('inventory_items', 'origin_currency_id')) {
                $table->foreignId('origin_currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            }
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_items', 'hsn_sac_compliance_code_id')) {
                $table->foreignId('hsn_sac_compliance_code_id')->nullable()->constrained('inventory_compliance_codes')->nullOnDelete();
            }
            if (! Schema::hasColumn('inventory_items', 'hs_tariff_compliance_code_id')) {
                $table->foreignId('hs_tariff_compliance_code_id')->nullable()->constrained('inventory_compliance_codes')->nullOnDelete();
            }
        });

        if (Schema::hasColumn('inventory_items', 'storage_temperature_class')) {
            $map = [
                'ambient' => 'AMBIENT',
                'chilled' => 'CHILLED',
                'frozen' => 'FROZEN',
                'controlled' => 'CONTROLLED',
            ];

            foreach (DB::table('inventory_items')->whereNotNull('storage_temperature_class')->get(['id', 'comp_id', 'storage_temperature_class']) as $row) {
                $legacy = (string) $row->storage_temperature_class;
                $needle = $map[$legacy] ?? strtoupper($legacy);

                $tcId = DB::table('inventory_temperature_classes')
                    ->where('company_id', $row->comp_id)
                    ->whereNull('deleted_at')
                    ->whereRaw('UPPER(TRIM(class_code)) = ?', [strtoupper(trim($needle))])
                    ->value('id');

                if ($tcId) {
                    DB::table('inventory_items')->where('id', $row->id)->update(['inventory_temperature_class_id' => $tcId]);
                }
            }

            Schema::table('inventory_items', function (Blueprint $table) {
                $table->dropColumn('storage_temperature_class');
            });
        }
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_items', 'hs_tariff_compliance_code_id')) {
                $table->dropForeign(['hs_tariff_compliance_code_id']);
                $table->dropColumn('hs_tariff_compliance_code_id');
            }
            if (Schema::hasColumn('inventory_items', 'hsn_sac_compliance_code_id')) {
                $table->dropForeign(['hsn_sac_compliance_code_id']);
                $table->dropColumn('hsn_sac_compliance_code_id');
            }
            if (Schema::hasColumn('inventory_items', 'origin_currency_id')) {
                $table->dropForeign(['origin_currency_id']);
                $table->dropColumn('origin_currency_id');
            }
            if (Schema::hasColumn('inventory_items', 'inventory_temperature_class_id')) {
                $table->dropForeign(['inventory_temperature_class_id']);
                $table->dropColumn('inventory_temperature_class_id');
            }
            if (Schema::hasColumn('inventory_items', 'package_type_id')) {
                $table->dropForeign(['package_type_id']);
                $table->dropColumn('package_type_id');
            }
        });

        Schema::dropIfExists('inventory_compliance_codes');

        Schema::table('inventory_items', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_items', 'storage_temperature_class')) {
                $table->string('storage_temperature_class', 50)->nullable();
            }
        });
    }
};
