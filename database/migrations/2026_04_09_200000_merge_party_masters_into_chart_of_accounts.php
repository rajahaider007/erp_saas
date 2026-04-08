<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('chart_of_accounts')) {
            return;
        }

        Schema::table('chart_of_accounts', function (Blueprint $table) {
            if (! Schema::hasColumn('chart_of_accounts', 'deleted_at')) {
                $table->softDeletes();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'party_type')) {
                $table->string('party_type', 20)->nullable()->after('location_id')->index();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'contact_person')) {
                $table->string('contact_person', 100)->nullable()->after('party_type');
            }
            if (! Schema::hasColumn('chart_of_accounts', 'email')) {
                $table->string('email', 100)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'phone')) {
                $table->string('phone', 20)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'address')) {
                $table->text('address')->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'city')) {
                $table->string('city', 100)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'state')) {
                $table->string('state', 100)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'postal_code')) {
                $table->string('postal_code', 20)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'country_id')) {
                $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'country_label')) {
                $table->string('country_label', 150)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'currency_id')) {
                $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'payment_terms')) {
                $table->string('payment_terms', 100)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'tax_id')) {
                $table->string('tax_id', 50)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'tax_registration_number')) {
                $table->string('tax_registration_number', 100)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'bank_details')) {
                $table->text('bank_details')->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'credit_limit')) {
                $table->decimal('credit_limit', 18, 2)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'vendor_type')) {
                $table->string('vendor_type', 20)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'party_notes')) {
                $table->text('party_notes')->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'contact_details')) {
                $table->string('contact_details', 255)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'vehicle_types')) {
                $table->string('vehicle_types', 255)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'service_area')) {
                $table->string('service_area', 255)->nullable();
            }
            if (! Schema::hasColumn('chart_of_accounts', 'transporter_rating')) {
                $table->decimal('transporter_rating', 3, 2)->nullable();
            }
        });

        if (Schema::hasTable('vendors') && Schema::hasColumn('vendors', 'chart_of_account_id')) {
            $vendors = DB::table('vendors')->whereNotNull('chart_of_account_id')->get();
            foreach ($vendors as $v) {
                DB::table('chart_of_accounts')->where('id', $v->chart_of_account_id)->update([
                    'party_type' => 'vendor',
                    'contact_person' => $v->contact_person,
                    'email' => $v->email,
                    'phone' => $v->phone,
                    'address' => $v->address,
                    'city' => $v->city,
                    'state' => $v->state,
                    'postal_code' => $v->postal_code,
                    'country_id' => $v->country_id,
                    'country_label' => $v->country_label ?? null,
                    'currency_id' => $v->currency_id ?? null,
                    'payment_terms' => $v->payment_terms ?? null,
                    'tax_id' => $v->tax_id,
                    'tax_registration_number' => $v->tax_registration_number ?? null,
                    'bank_details' => $v->bank_details ?? null,
                    'credit_limit' => $v->credit_limit ?? null,
                    'vendor_type' => $v->vendor_type ?? null,
                    'party_notes' => $v->notes ?? null,
                    'updated_at' => now(),
                ]);
            }
        }

        if (Schema::hasTable('inventory_customers') && Schema::hasColumn('inventory_customers', 'chart_of_account_id')) {
            $rows = DB::table('inventory_customers')->whereNotNull('chart_of_account_id')->get();
            foreach ($rows as $c) {
                DB::table('chart_of_accounts')->where('id', $c->chart_of_account_id)->update([
                    'party_type' => 'customer',
                    'contact_details' => $c->contact_details,
                    'credit_limit' => $c->credit_limit,
                    'payment_terms' => $c->payment_terms,
                    'tax_registration_number' => $c->tax_registration,
                    'country_id' => $c->country_id,
                    'country_label' => $c->country_label ?? null,
                    'currency_id' => $c->currency_id,
                    'updated_at' => now(),
                ]);
            }
        }

        if (Schema::hasTable('inventory_transporters') && Schema::hasColumn('inventory_transporters', 'chart_of_account_id')) {
            $rows = DB::table('inventory_transporters')->whereNotNull('chart_of_account_id')->get();
            foreach ($rows as $t) {
                DB::table('chart_of_accounts')->where('id', $t->chart_of_account_id)->update([
                    'party_type' => 'transporter',
                    'contact_details' => $t->contact_details,
                    'vehicle_types' => $t->vehicle_types,
                    'service_area' => $t->service_area,
                    'country_label' => $t->country_label ?? null,
                    'currency_id' => $t->currency_id ?? null,
                    'transporter_rating' => $t->rating,
                    'updated_at' => now(),
                ]);
            }
        }

        if (Schema::hasTable('inventory_items') && Schema::hasTable('vendors')) {
            if (Schema::hasColumn('inventory_items', 'default_vendor_id') && Schema::hasColumn('vendors', 'chart_of_account_id')) {
                DB::statement('
                    UPDATE inventory_items i
                    INNER JOIN vendors v ON v.id = i.default_vendor_id
                    SET i.default_vendor_id = v.chart_of_account_id
                    WHERE v.chart_of_account_id IS NOT NULL
                ');
                DB::statement('
                    UPDATE inventory_items i
                    INNER JOIN vendors v ON v.id = i.default_vendor_id
                    SET i.default_vendor_id = NULL
                    WHERE v.chart_of_account_id IS NULL
                ');
            }
        }

        if (Schema::hasColumn('inventory_items', 'default_vendor_id')) {
            $driver = Schema::getConnection()->getDriverName();
            if ($driver === 'mysql') {
                $fks = DB::select(
                    'SELECT CONSTRAINT_NAME AS name FROM information_schema.KEY_COLUMN_USAGE
                     WHERE TABLE_SCHEMA = DATABASE()
                     AND TABLE_NAME = ?
                     AND COLUMN_NAME = ?
                     AND REFERENCED_TABLE_NAME IS NOT NULL',
                    ['inventory_items', 'default_vendor_id']
                );
                foreach ($fks as $fk) {
                    if (! empty($fk->name)) {
                        DB::statement('ALTER TABLE inventory_items DROP FOREIGN KEY `'.$fk->name.'`');
                    }
                }
            } else {
                Schema::table('inventory_items', function (Blueprint $table) {
                    $table->dropForeign(['default_vendor_id']);
                });
            }
        }

        Schema::table('inventory_items', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_items', 'default_vendor_id')) {
                $table->foreign('default_vendor_id')
                    ->references('id')
                    ->on('chart_of_accounts')
                    ->nullOnDelete();
            }
        });

        if (Schema::hasTable('vendors')) {
            Schema::dropIfExists('vendors');
        }
        if (Schema::hasTable('inventory_customers')) {
            Schema::dropIfExists('inventory_customers');
        }
        if (Schema::hasTable('inventory_transporters')) {
            Schema::dropIfExists('inventory_transporters');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('chart_of_accounts')) {
            return;
        }

        if (Schema::hasColumn('inventory_items', 'default_vendor_id')) {
            $driver = Schema::getConnection()->getDriverName();
            if ($driver === 'mysql') {
                $fks = DB::select(
                    'SELECT CONSTRAINT_NAME AS name FROM information_schema.KEY_COLUMN_USAGE
                     WHERE TABLE_SCHEMA = DATABASE()
                     AND TABLE_NAME = ?
                     AND COLUMN_NAME = ?
                     AND REFERENCED_TABLE_NAME IS NOT NULL',
                    ['inventory_items', 'default_vendor_id']
                );
                foreach ($fks as $fk) {
                    if (! empty($fk->name)) {
                        DB::statement('ALTER TABLE inventory_items DROP FOREIGN KEY `'.$fk->name.'`');
                    }
                }
            } else {
                Schema::table('inventory_items', function (Blueprint $table) {
                    $table->dropForeign(['default_vendor_id']);
                });
            }
        }

        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('chart_of_account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->string('vendor_code', 20);
            $table->string('vendor_name', 150);
            $table->string('short_code', 30)->nullable();
            $table->string('contact_person', 100)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('payment_terms', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->foreignId('country_id')->nullable()->constrained('countries')->onDelete('set null');
            $table->string('country_label', 150)->nullable();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->string('tax_id', 50)->nullable();
            $table->string('tax_registration_number', 100)->nullable();
            $table->text('bank_details')->nullable();
            $table->decimal('credit_limit', 18, 2)->nullable();
            $table->string('vendor_type', 20)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['company_id', 'vendor_code']);
        });

        Schema::create('inventory_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('chart_of_account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->string('customer_code', 30);
            $table->string('customer_name', 150);
            $table->string('short_code', 30)->nullable();
            $table->string('contact_details', 255)->nullable();
            $table->decimal('credit_limit', 18, 2)->nullable();
            $table->string('payment_terms', 100)->nullable();
            $table->string('tax_registration', 100)->nullable();
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->string('country_label', 150)->nullable();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['company_id', 'customer_code', 'deleted_at'], 'customers_unique_active');
        });

        Schema::create('inventory_transporters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('chart_of_account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->string('transporter_code', 30);
            $table->string('transporter_name', 150);
            $table->string('short_code', 30)->nullable();
            $table->string('contact_details', 255)->nullable();
            $table->string('vehicle_types', 255)->nullable();
            $table->string('service_area', 255)->nullable();
            $table->string('country_label', 150)->nullable();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->decimal('rating', 3, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['company_id', 'transporter_code', 'deleted_at'], 'transporters_unique_active');
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_items', 'default_vendor_id')) {
                $table->foreign('default_vendor_id')
                    ->references('id')
                    ->on('vendors')
                    ->nullOnDelete();
            }
        });

        Schema::table('chart_of_accounts', function (Blueprint $table) {
            $cols = [
                'party_type', 'contact_person', 'email', 'phone', 'address', 'city', 'state', 'postal_code',
                'country_id', 'country_label', 'currency_id', 'payment_terms', 'tax_id', 'tax_registration_number',
                'bank_details', 'credit_limit', 'vendor_type', 'party_notes', 'contact_details', 'vehicle_types',
                'service_area', 'transporter_rating',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('chart_of_accounts', $col)) {
                    try {
                        $table->dropColumn($col);
                    } catch (\Throwable) {
                    }
                }
            }
        });
    }
};
