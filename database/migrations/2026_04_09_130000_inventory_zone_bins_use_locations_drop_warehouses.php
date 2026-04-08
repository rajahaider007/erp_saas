<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('inventory_zone_bins')) {
            return;
        }

        if (! Schema::hasColumn('inventory_zone_bins', 'location_id')) {
            Schema::table('inventory_zone_bins', function (Blueprint $table) {
                $table->unsignedBigInteger('location_id')->nullable()->after('company_id');
            });
        }

        if (Schema::hasColumn('inventory_zone_bins', 'warehouse_id') && Schema::hasTable('inventory_warehouses')) {
            foreach (DB::table('inventory_zone_bins')->select('id', 'company_id', 'warehouse_id')->get() as $zb) {
                $locId = null;
                if ($zb->warehouse_id) {
                    $w = DB::table('inventory_warehouses')->where('id', $zb->warehouse_id)->first();
                    if ($w && $w->location_id) {
                        $locId = $w->location_id;
                    }
                }
                if (! $locId) {
                    $locId = DB::table('locations')
                        ->where('company_id', $zb->company_id)
                        ->where('status', 1)
                        ->orderBy('id')
                        ->value('id');
                }
                if ($locId) {
                    DB::table('inventory_zone_bins')->where('id', $zb->id)->update(['location_id' => $locId]);
                }
            }

            DB::table('inventory_zone_bins')->whereNull('location_id')->delete();

            Schema::table('inventory_zone_bins', function (Blueprint $table) {
                $table->dropForeign(['warehouse_id']);
            });

            Schema::table('inventory_zone_bins', function (Blueprint $table) {
                $table->dropUnique('zone_bins_unique_active');
                $table->dropColumn('warehouse_id');
            });
        }

        DB::table('inventory_zone_bins')->whereNull('location_id')->delete();

        $this->dropForeignOnLocationIdIfPresent();

        Schema::table('inventory_zone_bins', function (Blueprint $table) {
            $table->unsignedBigInteger('location_id')->nullable(false)->change();
        });

        if (! $this->foreignKeyOnColumnExists('inventory_zone_bins', 'location_id')) {
            Schema::table('inventory_zone_bins', function (Blueprint $table) {
                $table->foreign('location_id')->references('id')->on('locations')->restrictOnDelete();
            });
        }

        if (! $this->indexExists('inventory_zone_bins', 'zone_bins_unique_active')) {
            Schema::table('inventory_zone_bins', function (Blueprint $table) {
                $table->unique(['company_id', 'location_id', 'bin_code', 'deleted_at'], 'zone_bins_unique_active');
            });
        }

        Schema::dropIfExists('inventory_warehouses');

        if (Schema::hasTable('menus')) {
            DB::table('menus')
                ->where('route', '/inventory/master-data/warehouse-master')
                ->update([
                    'menu_name' => 'Branch / Location (System)',
                    'route' => '/system/locations',
                    'updated_at' => now(),
                ]);
        }
    }

    private function dropForeignOnLocationIdIfPresent(): void
    {
        foreach (Schema::getForeignKeys('inventory_zone_bins') as $fk) {
            if (in_array('location_id', $fk['columns'], true)) {
                Schema::table('inventory_zone_bins', function (Blueprint $table) use ($fk) {
                    $table->dropForeign($fk['name']);
                });
                break;
            }
        }
    }

    private function foreignKeyOnColumnExists(string $table, string $column): bool
    {
        foreach (Schema::getForeignKeys($table) as $fk) {
            if (in_array($column, $fk['columns'], true)) {
                return true;
            }
        }

        return false;
    }

    private function indexExists(string $table, string $name): bool
    {
        foreach (Schema::getIndexes($table) as $index) {
            if (($index['name'] ?? '') === $name) {
                return true;
            }
        }

        return false;
    }

    public function down(): void
    {
        // Not reversible: warehouse rows were dropped; use system locations instead.
    }
};
