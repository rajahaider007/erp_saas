<?php

namespace Tests\Feature\RahjAi;

use App\Http\Middleware\WebAuthentication;
use App\Models\Menu;
use App\Models\User;
use App\Models\UserRight;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AssistantChatFlowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->prepareMinimalSchema();
    }

    public function test_chat_refuses_off_topic_message_via_llm_scope_gate(): void
    {
        Cache::flush();
        config([
            'services.groq.api_key' => 'test-fake-key',
            'services.groq.scope_gate_enabled' => true,
        ]);

        Http::fake([
            '*api.groq.com*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => '{"in_scope":false,"category":"personal"}',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $user = $this->makeUser();

        $response = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->postJson('/rahj-ai/chat', [
                'message' => 'gf ko kaisay ptaye',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.mode', 'out_of_scope')
            ->assertJsonPath('meta.scope_category', 'personal');

        $this->assertStringContainsString('ERP', (string) $response->json('answer'));
        Http::assertSentCount(1);
    }

    public function test_chat_returns_permission_denial_for_read_only_tool_when_user_lacks_view_right(): void
    {
        Cache::flush();
        $user = $this->makeUser();

        $menu = Menu::query()->create([
            'module_id' => 1,
            'section_id' => 1,
            'menu_name' => 'Inventory Reports',
            'route' => '/inventory/reports',
            'status' => true,
            'sort_order' => 1,
        ]);

        UserRight::query()->create([
            'user_id' => $user->id,
            'menu_id' => $menu->id,
            'can_view' => false,
            'can_add' => false,
            'can_edit' => false,
            'can_delete' => false,
        ]);

        $response = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->postJson('/rahj-ai/chat', [
                'message' => 'show inventory stock snapshot',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.mode', 'read_only')
            ->assertJsonPath('meta.permission', 'denied');
    }

    public function test_chat_recovers_after_date_range_clarification(): void
    {
        Cache::flush();
        $user = $this->makeUser();

        $menu = Menu::query()->create([
            'module_id' => 1,
            'section_id' => 1,
            'menu_name' => 'Accounts Dashboard',
            'route' => '/accounts/dashboard',
            'status' => true,
            'sort_order' => 1,
        ]);

        UserRight::query()->create([
            'user_id' => $user->id,
            'menu_id' => $menu->id,
            'can_view' => true,
            'can_add' => true,
            'can_edit' => false,
            'can_delete' => false,
        ]);

        $first = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->postJson('/rahj-ai/chat', [
                'message' => 'generate report summary',
            ]);

        $first
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.mode', 'clarification');

        $conversationId = $first->json('conversation_id');

        $second = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->postJson('/rahj-ai/chat', [
                'message' => '2026-04-01 to 2026-04-10',
                'conversation_id' => $conversationId,
            ]);

        $second
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.mode', 'clarification_resolved');

        $this->assertStringContainsString('Simple report summary', (string) $second->json('answer'));
    }

    public function test_chat_populates_metrics_cache_for_read_only_intelligence(): void
    {
        Cache::flush();
        $user = $this->makeUser();

        $menu = Menu::query()->create([
            'module_id' => 1,
            'section_id' => 1,
            'menu_name' => 'Inventory Reports',
            'route' => '/inventory/reports',
            'status' => true,
            'sort_order' => 1,
        ]);

        UserRight::query()->create([
            'user_id' => $user->id,
            'menu_id' => $menu->id,
            'can_view' => true,
            'can_add' => false,
            'can_edit' => false,
            'can_delete' => false,
        ]);

        $response = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->postJson('/rahj-ai/chat', [
                'message' => 'inventory stock and counts',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.mode', 'read_only')
            ->assertJsonPath('meta.intent', 'inventory');

        $cacheKey = 'rahj_ai_metrics_'.md5(json_encode([
            'comp_id' => 1,
            'location_id' => 1,
            'intent' => 'inventory',
            'date_range' => null,
        ]));

        $this->assertTrue(Cache::has($cacheKey), 'Expected read-only metrics cache key to be populated.');
    }

    public function test_conversation_list_and_history_replay_include_persisted_action_metadata(): void
    {
        Cache::flush();
        $user = $this->makeUser();

        $menu = Menu::query()->create([
            'module_id' => 1,
            'section_id' => 1,
            'menu_name' => 'Purchase Requisition',
            'route' => '/inventory/purchase-requisition',
            'status' => true,
            'sort_order' => 1,
        ]);

        UserRight::query()->create([
            'user_id' => $user->id,
            'menu_id' => $menu->id,
            'can_view' => true,
            'can_add' => true,
            'can_edit' => false,
            'can_delete' => false,
        ]);

        $chat = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->postJson('/rahj-ai/chat', [
                'message' => 'please create purchase requisition draft for office supplies',
            ]);

        $chat
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('meta.mode', 'assisted_entry')
            ->assertJsonPath('action.type', 'draft_prefill')
            ->assertJsonPath('action.target', 'purchase_requisition');

        $conversationId = (int) $chat->json('conversation_id');
        $this->assertGreaterThan(0, $conversationId);

        $list = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->getJson('/rahj-ai/conversations');

        $list
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'conversations')
            ->assertJsonPath('conversations.0.id', $conversationId);

        $history = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->getJson('/rahj-ai/history?conversation_id='.$conversationId);

        $history
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('conversation_id', $conversationId)
            ->assertJsonPath('messages.1.role', 'assistant')
            ->assertJsonPath('messages.1.meta.mode', 'assisted_entry')
            ->assertJsonPath('messages.1.action.type', 'draft_prefill')
            ->assertJsonPath('messages.1.action.target', 'purchase_requisition')
            ->assertJsonPath('messages.1.action.requires_review', true);
    }

    public function test_clear_all_conversations_deletes_all_threads_for_current_user(): void
    {
        Cache::flush();
        $user = $this->makeUser();

        $menu = Menu::query()->create([
            'module_id' => 1,
            'section_id' => 1,
            'menu_name' => 'Inventory Reports',
            'route' => '/inventory/reports',
            'status' => true,
            'sort_order' => 1,
        ]);

        UserRight::query()->create([
            'user_id' => $user->id,
            'menu_id' => $menu->id,
            'can_view' => true,
            'can_add' => false,
            'can_edit' => false,
            'can_delete' => false,
        ]);

        $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->postJson('/rahj-ai/chat', [
                'message' => 'inventory stock snapshot for this month',
            ])
            ->assertOk();

        $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->postJson('/rahj-ai/chat', [
                'message' => 'inventory stock snapshot for last month',
            ])
            ->assertOk();

        $before = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->getJson('/rahj-ai/conversations');

        $before
            ->assertOk()
            ->assertJsonPath('success', true);
        $this->assertGreaterThanOrEqual(2, count((array) $before->json('conversations')));

        $clearAll = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->deleteJson('/rahj-ai/conversations');

        $clearAll
            ->assertOk()
            ->assertJsonPath('success', true);
        $this->assertGreaterThanOrEqual(2, (int) $clearAll->json('deleted'));

        $after = $this
            ->withoutMiddleware(WebAuthentication::class)
            ->actingAs($user)
            ->getJson('/rahj-ai/conversations');

        $after
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(0, 'conversations');
    }

    private function makeUser(): User
    {
        return User::query()->create([
            'fname' => 'RAHJ',
            'lname' => 'Tester',
            'email' => 'rahj.tester+'.uniqid().'@example.com',
            'loginid' => 'rahj_tester_'.uniqid(),
            'password' => bcrypt('password'),
            'status' => 'active',
            'role' => 'user',
            'comp_id' => 1,
            'location_id' => 1,
        ]);
    }

    private function prepareMinimalSchema(): void
    {
        $tables = [
            'user_rights',
            'rahj_ai_messages',
            'rahj_ai_conversations',
            'grn_supplier_invoices',
            'goods_receipt_note_lines',
            'goods_receipt_notes',
            'purchase_order_lines',
            'purchase_orders',
            'purchase_requisition_lines',
            'purchase_requisitions',
            'inventory_items',
            'transactions',
            'menus',
            'tbl_users',
        ];

        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }

        Schema::create('tbl_users', function (Blueprint $table): void {
            $table->id();
            $table->string('fname', 100);
            $table->string('lname', 100);
            $table->string('email')->unique();
            $table->string('loginid')->unique();
            $table->string('password');
            $table->string('status', 20)->default('active');
            $table->string('role', 40)->default('user');
            $table->unsignedBigInteger('comp_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->text('permissions')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('menus', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('module_id');
            $table->unsignedBigInteger('section_id');
            $table->string('menu_name');
            $table->string('route')->nullable();
            $table->boolean('status')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('user_rights', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('menu_id');
            $table->boolean('can_view')->default(false);
            $table->boolean('can_add')->default(false);
            $table->boolean('can_edit')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->timestamps();
        });

        Schema::create('rahj_ai_conversations', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('session_key', 120)->nullable();
            $table->string('title', 200)->nullable();
            $table->timestamps();
        });

        Schema::create('rahj_ai_messages', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('conversation_id');
            $table->string('role', 20);
            $table->longText('content');
            $table->string('model', 120)->nullable();
            $table->text('sources')->nullable();
            $table->boolean('is_error')->default(false);
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->string('voucher_type', 80)->nullable();
            $table->string('status', 40)->nullable();
            $table->date('voucher_date')->nullable();
            $table->decimal('total_credit', 18, 2)->default(0);
            $table->decimal('total_debit', 18, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('purchase_requisitions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->date('pr_date')->nullable();
            $table->string('status', 40)->default('draft');
            $table->timestamps();
        });

        Schema::create('purchase_requisition_lines', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('purchase_requisition_id');
            $table->decimal('quantity', 18, 6)->default(0);
            $table->timestamps();
        });

        Schema::create('purchase_orders', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->date('po_date')->nullable();
            $table->string('status', 40)->default('draft');
            $table->timestamps();
        });

        Schema::create('purchase_order_lines', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('purchase_order_id');
            $table->decimal('ordered_qty', 18, 6)->default(0);
            $table->timestamps();
        });

        Schema::create('goods_receipt_notes', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->date('receipt_date')->nullable();
            $table->string('status', 40)->default('draft');
            $table->timestamps();
        });

        Schema::create('goods_receipt_note_lines', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('goods_receipt_note_id');
            $table->decimal('receipt_qty', 18, 6)->default(0);
            $table->timestamps();
        });

        Schema::create('grn_supplier_invoices', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->date('voucher_date')->nullable();
            $table->string('status', 40)->default('draft');
            $table->timestamps();
        });
    }
}
