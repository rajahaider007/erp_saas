<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fixes environments where rahj_ai_* migrations are recorded in `migrations`
 * but the tables were never created or were dropped later.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('rahj_ai_conversations')) {
            Schema::create('rahj_ai_conversations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->string('session_key', 120)->nullable()->index();
                $table->string('title', 200)->nullable();
                $table->timestamps();

                $table->index(['user_id', 'created_at'], 'rahj_ai_conversations_user_created_idx');
            });

            if (Schema::hasTable('tbl_users')) {
                Schema::table('rahj_ai_conversations', function (Blueprint $table) {
                    $table->foreign('user_id', 'rahj_ai_conversations_user_fk')
                        ->references('id')
                        ->on('tbl_users')
                        ->nullOnDelete();
                });
            }
        }

        if (! Schema::hasTable('rahj_ai_messages')) {
            Schema::create('rahj_ai_messages', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('conversation_id')->index();
                $table->string('role', 20);
                $table->longText('content');
                $table->string('model', 120)->nullable();
                $table->json('sources')->nullable();
                $table->boolean('is_error')->default(false);
                $table->timestamps();

                $table->index(['conversation_id', 'created_at'], 'rahj_ai_messages_conv_created_idx');
            });

            if (Schema::hasTable('rahj_ai_conversations')) {
                Schema::table('rahj_ai_messages', function (Blueprint $table) {
                    $table->foreign('conversation_id', 'rahj_ai_messages_conversation_fk')
                        ->references('id')
                        ->on('rahj_ai_conversations')
                        ->cascadeOnDelete();
                });
            }
        }
    }

    public function down(): void
    {
        // Intentionally empty: do not drop production chat history.
    }
};
