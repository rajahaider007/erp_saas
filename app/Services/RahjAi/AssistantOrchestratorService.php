<?php

namespace App\Services\RahjAi;

use App\Models\Menu;
use App\Models\RahjAiMessage;
use App\Models\User;
use App\Services\TranslationLoaderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AssistantOrchestratorService
{
    private EnhancedRagService $enhancedRag;

    private RealtimeDataService $realtimeData;

    private ProfessionalFormService $formService;

    private SystemContextService $contextService;

    private FinancialIntentMatcher $financialMatcher;

    public function __construct(
        ?EnhancedRagService $enhancedRag = null,
        ?RealtimeDataService $realtimeData = null,
        ?ProfessionalFormService $formService = null,
        ?SystemContextService $contextService = null,
        ?FinancialIntentMatcher $financialMatcher = null
    ) {
        $this->enhancedRag = $enhancedRag ?? app(EnhancedRagService::class);
        $this->realtimeData = $realtimeData ?? app(RealtimeDataService::class);
        $this->formService = $formService ?? app(ProfessionalFormService::class);
        $this->contextService = $contextService ?? app(SystemContextService::class);
        $this->financialMatcher = $financialMatcher ?? app(FinancialIntentMatcher::class);
    }

    public function respond(
        Request $request,
        string $question,
        RagCorpusService $ragCorpus,
        GroqChatService $groq,
        ?int $conversationId = null
    ): array {
        $normalized = mb_strtolower(trim($question));
        $context = $this->buildScopeContext($request);
        $user = $request->user();
        $languageHint = $this->detectLanguageHint($question);
        $smartEntry = new SmartEntryService;

        // Build system context for better awareness
        $systemContext = $this->contextService->buildUserContext($request);

        $pending = $this->getPendingClarification($request, $conversationId);
        if ($pending) {
            $resolution = $this->tryResolveSmartEntryFlow($question, $pending, $context, $user, $smartEntry, $conversationId, $request, $languageHint);
            if ($resolution !== null) {
                return $resolution;
            }

            $resolved = $this->tryResolvePendingClarification($question, $pending, $context, $user);
            if ($resolved !== null) {
                $this->clearPendingClarification($request, $conversationId);

                return $this->localResponse(
                    $resolved['answer'],
                    $resolved['sources'] ?? [],
                    $resolved['meta'] ?? [],
                    $languageHint
                );
            }
        }

        if ($smartEntry->isCoaCodeCreationIntent($normalized)) {
            $smartResponse = $this->handleSmartCoaCodeEntry($question, $context, $user, $request, $conversationId, $languageHint, $smartEntry);
            if ($smartResponse !== null) {
                return $smartResponse;
            }
        }

        if ($this->isAssistedEntryIntent($normalized)) {
            $draftResponse = $this->buildDraftPrefillResponse($question, $context, $languageHint, $user);
            if ($draftResponse !== null) {
                return $draftResponse;
            }
        }

        if ($this->isReadOnlyIntent($normalized)) {
            $toolResponse = $this->handleReadOnlyIntent($request, $question, $normalized, $context, $conversationId, $languageHint, $user);
            if ($toolResponse !== null) {
                return $toolResponse;
            }
        }

        if (! $this->groqApiConfigured()) {
            return $this->localResponse(
                $this->groqMissingKeyMessage($request),
                [],
                [
                    'mode' => 'groq_not_configured',
                    'hint' => 'GROQ_API_KEY',
                ],
                $languageHint,
                false
            );
        }

        $scopeDecision = $groq->evaluateErpMessageScope($question, $languageHint);
        if (! ($scopeDecision['in_scope'] ?? true)) {
            return $this->localResponse(
                $this->outOfScopeRefusalMessage($languageHint),
                [],
                [
                    'mode' => 'out_of_scope',
                    'scope_category' => $scopeDecision['category'] ?? null,
                ],
                $languageHint,
                false
            );
        }

        // Use enhanced RAG with real-time data
        $topK = (int) config('services.groq.rag_top_k', 5);
        $chunks = $this->enhancedRag->intelligentRetrieve(
            $question,
            $context['comp_id'] ?? 1,
            $context['location_id'] ?? 1,
            max(1, min(10, $topK))
        );

        $sessionBrief = $this->contextService->summarizeForAssistantPrompt($systemContext);
        $chatHistory = $this->loadConversationChatHistory($conversationId);
        $reply = $groq->ask($question, $chunks, [
            'session_brief' => $sessionBrief,
            'language_hint' => $languageHint,
            'chat_history' => $chatHistory,
        ]);

        $verification = $groq->verifyGroundedDraft($question, $chunks, $reply['answer']);
        $ragMeta = [
            'mode' => 'rag',
            'language_hint' => $languageHint,
            'routing' => $reply['routing'] ?? null,
            'verifier' => $verification,
        ];
        if (($verification['status'] ?? '') === 'warn' && ! empty($verification['detail'])) {
            $reply['answer'] .= "\n\n*Verifier note:* ".$verification['detail'];
        }

        $sources = array_map(static function (array $chunk): array {
            return [
                'source_type' => $chunk['source_type'] ?? null,
                'source_path' => $chunk['source_path'] ?? null,
                'document_title' => $chunk['document_title'] ?? null,
                'section_title' => $chunk['section_title'] ?? null,
                'table_name' => $chunk['table_name'] ?? null,
            ];
        }, $chunks);

        return [
            'answer' => $reply['answer'],
            'model' => $reply['model'],
            'sources' => $sources,
            'meta' => $ragMeta,
        ];
    }

    /**
     * @return list<array{role: string, content: string}>
     */
    protected function loadConversationChatHistory(?int $conversationId): array
    {
        if (! $conversationId || $conversationId < 1) {
            return [];
        }

        $maxMessages = max(1, min(100, (int) config('services.groq.chat_history_max_messages', 24)));

        $rows = RahjAiMessage::query()
            ->where('conversation_id', $conversationId)
            ->orderByDesc('id')
            ->limit($maxMessages)
            ->get()
            ->sortBy('id')
            ->values();

        $out = [];
        foreach ($rows as $row) {
            $role = (string) $row->role;
            if (! in_array($role, ['user', 'assistant'], true)) {
                continue;
            }
            $content = trim((string) $row->content);
            if ($content === '') {
                continue;
            }
            $out[] = ['role' => $role, 'content' => $content];
        }

        return $out;
    }

    protected function handleReadOnlyIntent(
        Request $request,
        string $question,
        string $normalized,
        array $scope,
        ?int $conversationId,
        string $languageHint,
        ?User $user
    ): ?array {
        if (! $scope['comp_id'] || ! $scope['location_id']) {
            $this->savePendingClarification($request, $conversationId, [
                'intent' => 'missing_scope',
                'question' => $question,
            ]);

            return $this->localResponse(
                'I can help, but first please confirm company and location. Kis company / location ka data chahiye?',
                [],
                [
                    'mode' => 'clarification',
                    'needs' => ['company', 'location'],
                ],
                $languageHint
            );
        }

        $intent = $this->classifyReadOnlyIntent($normalized);
        $dateRange = $this->extractDateRange($question);
        $finDef = $this->financialMatcher->definitionForIntent($intent);

        if ($intent === 'report' && $dateRange === null) {
            $this->savePendingClarification($request, $conversationId, [
                'intent' => 'report',
                'scope' => $scope,
                'question' => $question,
            ]);

            return $this->localResponse(
                'I can generate this report. Please share date range (for example: 2026-04-01 to 2026-04-10). Date range kya rakhna hai?',
                [],
                [
                    'mode' => 'clarification',
                    'needs' => ['date_range'],
                ],
                $languageHint
            );
        }

        $menuRoute = match (true) {
            $intent === 'inventory' => '/inventory/reports',
            $finDef !== null => '/accounts/dashboard',
            in_array($intent, ['receivables', 'report'], true) => '/accounts/dashboard',
            default => '/inventory/reports',
        };

        if (! $this->canViewMenuRoute($user, $menuRoute)) {
            return $this->localResponse(
                'Permission denied for this request. Please contact your administrator to enable view rights for the requested module.',
                [],
                [
                    'mode' => 'read_only',
                    'intent' => $intent,
                    'permission' => 'denied',
                ],
                $languageHint
            );
        }

        $cacheKey = $this->metricsCacheKey($scope, $intent, $dateRange);
        $metrics = Cache::remember($cacheKey, now()->addSeconds(120), function () use ($intent, $finDef, $scope, $dateRange) {
            if ($finDef !== null) {
                return $this->realtimeData->getAccountsDashboardFinancialSnapshot(
                    (int) $scope['comp_id'],
                    (int) $scope['location_id'],
                    (string) $finDef['report_type'],
                    $dateRange
                );
            }

            return match ($intent) {
                'inventory' => $this->inventorySnapshot((int) $scope['comp_id'], (int) $scope['location_id'], $dateRange),
                'receivables' => $this->receivablesSnapshot((int) $scope['comp_id'], (int) $scope['location_id'], $dateRange),
                'report' => $this->simpleReport((int) $scope['comp_id'], (int) $scope['location_id'], $dateRange),
                default => $this->inventorySnapshot((int) $scope['comp_id'], (int) $scope['location_id'], $dateRange),
            };
        });

        $answer = $finDef !== null
            ? $this->formatFinancialDashboardAnswer($finDef, $metrics, $dateRange)
            : $this->formatMetricsAnswer($intent, $metrics, $dateRange);

        $sourcePath = $finDef['report_path'] ?? $menuRoute;

        return $this->localResponse(
            $answer,
            [
                [
                    'source_type' => 'application_tool',
                    'source_path' => $sourcePath,
                    'document_title' => $finDef !== null
                        ? 'Live '.$finDef['answer_title'].' (DB)'
                        : 'Permission-aware read-only tool',
                    'section_title' => $finDef !== null ? 'FinancialIntentMatcher + RealtimeDataService' : 'Phase B intelligence',
                    'table_name' => $finDef !== null
                        ? 'chart_of_accounts,account_configurations,transaction_entries'
                        : null,
                ],
            ],
            [
                'mode' => 'read_only',
                'intent' => $intent,
                'scope' => $scope,
                'date_range' => $dateRange,
                'cached' => true,
            ],
            $languageHint
        );
    }

    protected function buildDraftPrefillResponse(string $question, array $scope, string $languageHint, ?User $user): ?array
    {
        $normalized = mb_strtolower($question);
        $today = now()->format('Y-m-d');

        if (str_contains($normalized, 'purchase requisition') || preg_match('/\bpr\b/i', $question)) {
            if (! $this->canAccessMenuRoute($user, '/inventory/purchase-requisition', 'can_add')) {
                return $this->draftPermissionDenied('purchase requisition', $languageHint);
            }

            $payload = [
                'pr_date' => $today,
                'required_by_date' => now()->addDays(7)->format('Y-m-d'),
                'priority' => 'normal',
                'requested_by' => null,
                'justification' => $question,
                'notes' => 'Draft generated by RAHJ AI. Please review before saving.',
            ];

            return $this->localResponse(
                "Draft prefill ready for Purchase Requisition.\n1) Open [Create Purchase Requisition](/inventory/purchase-requisition/create).\n2) Review and adjust values.\n3) Save through normal form flow (same validation as manual entry).",
                $this->draftSources('/inventory/purchase-requisition/create'),
                [
                    'mode' => 'assisted_entry',
                    'action' => [
                        'type' => 'draft_prefill',
                        'target' => 'purchase_requisition',
                        'route' => '/inventory/purchase-requisition/create',
                        'payload' => $payload,
                        'requires_review' => true,
                    ],
                    'scope' => $scope,
                ],
                $languageHint
            );
        }

        if (str_contains($normalized, 'purchase order') || preg_match('/\bpo\b/i', $question)) {
            if (! $this->canAccessMenuRoute($user, '/inventory/purchase-order', 'can_add')) {
                return $this->draftPermissionDenied('purchase order', $languageHint);
            }

            $payload = [
                'po_date' => $today,
                'expected_delivery_date' => now()->addDays(10)->format('Y-m-d'),
                'po_type' => 'standard',
                'tax_inclusive' => false,
                'notes' => 'Draft generated by RAHJ AI. Please review vendor, lines, and amounts.',
            ];

            return $this->localResponse(
                "Draft prefill ready for Purchase Order.\n1) Open [Create Purchase Order](/inventory/purchase-order/create).\n2) Review vendor, items, and rates.\n3) Save using normal flow.",
                $this->draftSources('/inventory/purchase-order/create'),
                [
                    'mode' => 'assisted_entry',
                    'action' => [
                        'type' => 'draft_prefill',
                        'target' => 'purchase_order',
                        'route' => '/inventory/purchase-order/create',
                        'payload' => $payload,
                        'requires_review' => true,
                    ],
                    'scope' => $scope,
                ],
                $languageHint
            );
        }

        if (str_contains($normalized, 'goods receipt') || str_contains($normalized, 'grn')) {
            if (! $this->canAccessMenuRoute($user, '/inventory/goods-receipt-note', 'can_add')) {
                return $this->draftPermissionDenied('goods receipt note', $languageHint);
            }

            $payload = [
                'receipt_date' => $today,
                'posting_date' => $today,
                'grn_type' => 'standard',
                'notes' => 'Draft generated by RAHJ AI. Please review line quantities and QC status.',
            ];

            return $this->localResponse(
                "Draft prefill ready for Goods Receipt Note.\n1) Open [Create Goods Receipt Note](/inventory/goods-receipt-note/create).\n2) Verify linked PO and quantities.\n3) Save/post through normal workflow.",
                $this->draftSources('/inventory/goods-receipt-note/create'),
                [
                    'mode' => 'assisted_entry',
                    'action' => [
                        'type' => 'draft_prefill',
                        'target' => 'goods_receipt_note',
                        'route' => '/inventory/goods-receipt-note/create',
                        'payload' => $payload,
                        'requires_review' => true,
                    ],
                    'scope' => $scope,
                ],
                $languageHint
            );
        }

        if (str_contains($normalized, 'journal voucher') || str_contains($normalized, 'jv')) {
            if (! $this->canAccessMenuRoute($user, '/accounts/journal-voucher', 'can_add')) {
                return $this->draftPermissionDenied('journal voucher', $languageHint);
            }

            $payload = [
                'voucher_date' => $today,
                'description' => $question,
                'reference_number' => null,
            ];

            return $this->localResponse(
                "Draft prefill ready for Journal Voucher.\n1) Open [Create Journal Voucher](/accounts/journal-voucher/create).\n2) Review debit/credit lines.\n3) Save via normal flow.",
                $this->draftSources('/accounts/journal-voucher/create'),
                [
                    'mode' => 'assisted_entry',
                    'action' => [
                        'type' => 'draft_prefill',
                        'target' => 'journal_voucher',
                        'route' => '/accounts/journal-voucher/create',
                        'payload' => $payload,
                        'requires_review' => true,
                    ],
                    'scope' => $scope,
                ],
                $languageHint
            );
        }

        if (str_contains($normalized, 'bank voucher') || str_contains($normalized, 'bpv') || str_contains($normalized, 'brv')) {
            if (! $this->canAccessMenuRoute($user, '/accounts/bank-voucher', 'can_add')) {
                return $this->draftPermissionDenied('bank voucher', $languageHint);
            }

            $voucherSubType = str_contains($normalized, 'receipt') ? 'Bank Receipt' : 'Bank Payment';
            $payload = [
                'voucher_date' => $today,
                'voucher_sub_type' => $voucherSubType,
                'bank_account_id' => '',
                'description' => $question,
                'reference_number' => null,
            ];

            return $this->localResponse(
                "Draft prefill ready for Bank Voucher.\n1) Open [Create Bank Voucher](/accounts/bank-voucher/create).\n2) Select bank account and review entries.\n3) Save through normal validation.",
                $this->draftSources('/accounts/bank-voucher/create'),
                [
                    'mode' => 'assisted_entry',
                    'action' => [
                        'type' => 'draft_prefill',
                        'target' => 'bank_voucher',
                        'route' => '/accounts/bank-voucher/create',
                        'payload' => $payload,
                        'requires_review' => true,
                    ],
                    'scope' => $scope,
                ],
                $languageHint
            );
        }

        if (str_contains($normalized, 'cash voucher') || str_contains($normalized, 'cpv') || str_contains($normalized, 'crv')) {
            if (! $this->canAccessMenuRoute($user, '/accounts/cash-voucher', 'can_add')) {
                return $this->draftPermissionDenied('cash voucher', $languageHint);
            }

            $voucherSubType = str_contains($normalized, 'receipt') ? 'Cash Receipt' : 'Cash Payment';
            $payload = [
                'voucher_date' => $today,
                'voucher_sub_type' => $voucherSubType,
                'Cash_account_id' => '',
                'description' => $question,
                'reference_number' => null,
            ];

            return $this->localResponse(
                "Draft prefill ready for Cash Voucher.\n1) Open [Create Cash Voucher](/accounts/cash-voucher/create).\n2) Select cash account and verify lines.\n3) Save using normal form flow.",
                $this->draftSources('/accounts/cash-voucher/create'),
                [
                    'mode' => 'assisted_entry',
                    'action' => [
                        'type' => 'draft_prefill',
                        'target' => 'cash_voucher',
                        'route' => '/accounts/cash-voucher/create',
                        'payload' => $payload,
                        'requires_review' => true,
                    ],
                    'scope' => $scope,
                ],
                $languageHint
            );
        }

        if (str_contains($normalized, 'opening voucher')) {
            if (! $this->canAccessMenuRoute($user, '/accounts/opening-voucher', 'can_add')) {
                return $this->draftPermissionDenied('opening voucher', $languageHint);
            }

            $payload = [
                'voucher_date' => $today,
                'description' => $question,
                'reference_number' => null,
            ];

            return $this->localResponse(
                "Draft prefill ready for Opening Voucher.\n1) Open [Create Opening Voucher](/accounts/opening-voucher/create).\n2) Review opening debit/credit lines.\n3) Save through normal validation.",
                $this->draftSources('/accounts/opening-voucher/create'),
                [
                    'mode' => 'assisted_entry',
                    'action' => [
                        'type' => 'draft_prefill',
                        'target' => 'opening_voucher',
                        'route' => '/accounts/opening-voucher/create',
                        'payload' => $payload,
                        'requires_review' => true,
                    ],
                    'scope' => $scope,
                ],
                $languageHint
            );
        }

        return null;
    }

    protected function inventorySnapshot(int $compId, int $locationId, ?array $dateRange): array
    {
        $itemsTotal = DB::table('inventory_items')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereNull('deleted_at')
            ->count();

        $itemsActive = DB::table('inventory_items')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereNull('deleted_at')
            ->where('is_active', true)
            ->count();

        $requestedQty = DB::table('purchase_requisition_lines as l')
            ->join('purchase_requisitions as h', 'h.id', '=', 'l.purchase_requisition_id')
            ->where('h.comp_id', $compId)
            ->where('h.location_id', $locationId)
            ->when($dateRange, function ($q) use ($dateRange) {
                $q->whereBetween('h.pr_date', [$dateRange['from'], $dateRange['to']]);
            })
            ->sum('l.quantity');

        $orderedQty = DB::table('purchase_order_lines as l')
            ->join('purchase_orders as h', 'h.id', '=', 'l.purchase_order_id')
            ->where('h.comp_id', $compId)
            ->where('h.location_id', $locationId)
            ->when($dateRange, function ($q) use ($dateRange) {
                $q->whereBetween('h.po_date', [$dateRange['from'], $dateRange['to']]);
            })
            ->sum('l.ordered_qty');

        $receivedQty = DB::table('goods_receipt_note_lines as l')
            ->join('goods_receipt_notes as h', 'h.id', '=', 'l.goods_receipt_note_id')
            ->where('h.comp_id', $compId)
            ->where('h.location_id', $locationId)
            ->when($dateRange, function ($q) use ($dateRange) {
                $q->whereBetween('h.receipt_date', [$dateRange['from'], $dateRange['to']]);
            })
            ->sum('l.receipt_qty');

        $countsByDoc = [
            'purchase_requisitions' => $this->countByStatus('purchase_requisitions', $compId, $locationId, $dateRange, 'pr_date'),
            'purchase_orders' => $this->countByStatus('purchase_orders', $compId, $locationId, $dateRange, 'po_date'),
            'goods_receipt_notes' => $this->countByStatus('goods_receipt_notes', $compId, $locationId, $dateRange, 'receipt_date'),
            'grn_supplier_invoices' => $this->countByStatus('grn_supplier_invoices', $compId, $locationId, $dateRange, 'voucher_date'),
        ];

        return [
            'items_total' => $itemsTotal,
            'items_active' => $itemsActive,
            'requested_qty' => round((float) $requestedQty, 3),
            'ordered_qty' => round((float) $orderedQty, 3),
            'received_qty' => round((float) $receivedQty, 3),
            'doc_counts' => $countsByDoc,
        ];
    }

    protected function receivablesSnapshot(int $compId, int $locationId, ?array $dateRange): array
    {
        $rows = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->whereIn('voucher_type', ['Sales Invoice', 'Invoice'])
            ->whereIn('status', ['Draft', 'Pending', 'Approved'])
            ->when($dateRange, function ($q) use ($dateRange) {
                $q->whereBetween('voucher_date', [$dateRange['from'], $dateRange['to']]);
            })
            ->get(['id', 'voucher_date', 'total_credit']);

        $amount = 0.0;
        $aging = [
            '0_30' => ['count' => 0, 'amount' => 0.0],
            '31_60' => ['count' => 0, 'amount' => 0.0],
            '61_90' => ['count' => 0, 'amount' => 0.0],
            '90_plus' => ['count' => 0, 'amount' => 0.0],
        ];

        $today = Carbon::today();
        foreach ($rows as $row) {
            $lineAmount = (float) ($row->total_credit ?? 0);
            $amount += $lineAmount;

            $days = 0;
            if (! empty($row->voucher_date)) {
                try {
                    $days = Carbon::parse($row->voucher_date)->diffInDays($today, false);
                    $days = max(0, $days);
                } catch (\Throwable) {
                    $days = 0;
                }
            }

            if ($days <= 30) {
                $bucket = '0_30';
            } elseif ($days <= 60) {
                $bucket = '31_60';
            } elseif ($days <= 90) {
                $bucket = '61_90';
            } else {
                $bucket = '90_plus';
            }

            $aging[$bucket]['count']++;
            $aging[$bucket]['amount'] += $lineAmount;
        }

        foreach ($aging as $k => $v) {
            $aging[$k]['amount'] = round((float) $v['amount'], 2);
        }

        return [
            'outstanding_count' => $rows->count(),
            'outstanding_amount' => round($amount, 2),
            'aging' => $aging,
        ];
    }

    protected function simpleReport(int $compId, int $locationId, ?array $dateRange): array
    {
        $base = DB::table('transactions')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId);

        if ($dateRange) {
            $base->whereBetween('voucher_date', [$dateRange['from'], $dateRange['to']]);
        }

        $rows = (clone $base)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderByDesc('total')
            ->get();

        $voucherRows = (clone $base)
            ->select('voucher_type', DB::raw('COUNT(*) as total'))
            ->groupBy('voucher_type')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $totals = (clone $base)
            ->selectRaw('COALESCE(SUM(total_debit),0) as total_debit, COALESCE(SUM(total_credit),0) as total_credit, COUNT(*) as total_rows')
            ->first();

        return [
            'total_rows' => (int) ($totals->total_rows ?? 0),
            'total_debit' => round((float) ($totals->total_debit ?? 0), 2),
            'total_credit' => round((float) ($totals->total_credit ?? 0), 2),
            'status_breakdown' => $rows->map(function ($r) {
                return ['status' => (string) $r->status, 'count' => (int) $r->total];
            })->values()->all(),
            'top_voucher_types' => $voucherRows->map(function ($r) {
                return ['voucher_type' => (string) $r->voucher_type, 'count' => (int) $r->total];
            })->values()->all(),
        ];
    }

    protected function countByStatus(string $table, int $compId, int $locationId, ?array $dateRange, ?string $dateColumn = null): array
    {
        $rows = DB::table($table)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->when($dateRange && $dateColumn, function ($q) use ($dateRange, $dateColumn) {
                $q->whereBetween($dateColumn, [$dateRange['from'], $dateRange['to']]);
            })
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get();

        $result = [];
        foreach ($rows as $row) {
            $result[(string) $row->status] = (int) $row->total;
        }

        return $result;
    }

    protected function classifyReadOnlyIntent(string $normalized): string
    {
        if ($row = $this->financialMatcher->match($normalized)) {
            return (string) $row['intent'];
        }

        if (
            str_contains($normalized, 'stock') ||
            str_contains($normalized, 'inventory') ||
            str_contains($normalized, 'pr status') ||
            str_contains($normalized, 'po status') ||
            str_contains($normalized, 'grn status') ||
            str_contains($normalized, 'purchase requisition') ||
            str_contains($normalized, 'purchase order') ||
            str_contains($normalized, 'goods receipt')
        ) {
            return 'inventory';
        }

        if (
            str_contains($normalized, 'receivable') ||
            str_contains($normalized, 'outstanding') ||
            str_contains($normalized, 'invoice aging') ||
            str_contains($normalized, 'debtor')
        ) {
            return 'receivables';
        }

        if (
            str_contains($normalized, 'report') ||
            str_contains($normalized, 'summary') ||
            str_contains($normalized, 'between') ||
            str_contains($normalized, 'date range')
        ) {
            return 'report';
        }

        return 'report';
    }

    protected function isStructureKnowledgeIntent(string $normalized): bool
    {
        return
            str_contains($normalized, 'chart of account') ||
            str_contains($normalized, 'coa') ||
            str_contains($normalized, 'level') ||
            str_contains($normalized, 'levels') ||
            str_contains($normalized, 'form') ||
            str_contains($normalized, 'field') ||
            str_contains($normalized, 'fields') ||
            str_contains($normalized, 'screen') ||
            str_contains($normalized, 'kitnay level') ||
            str_contains($normalized, 'kitne level');
    }

    protected function isReadOnlyIntent(string $normalized): bool
    {
        if ($this->isStructureKnowledgeIntent($normalized)) {
            return false;
        }

        if ($this->financialMatcher->match($normalized) !== null) {
            return true;
        }

        $hasMetricSignal = (
            str_contains($normalized, 'snapshot') ||
            str_contains($normalized, 'status') ||
            str_contains($normalized, 'statuses') ||
            str_contains($normalized, 'qty') ||
            str_contains($normalized, 'quantity') ||
            str_contains($normalized, 'outstanding') ||
            str_contains($normalized, 'aging') ||
            str_contains($normalized, 'report') ||
            str_contains($normalized, 'summary') ||
            str_contains($normalized, 'metric') ||
            str_contains($normalized, 'metrics')
        );

        $hasOperationalDomain = (
            str_contains($normalized, 'stock') ||
            str_contains($normalized, 'inventory') ||
            str_contains($normalized, 'receivable') ||
            str_contains($normalized, 'debtor') ||
            str_contains($normalized, 'invoice') ||
            str_contains($normalized, 'purchase requisition') ||
            str_contains($normalized, 'purchase order') ||
            str_contains($normalized, 'goods receipt') ||
            str_contains($normalized, 'transaction')
        );

        return $hasMetricSignal && $hasOperationalDomain;
    }

    /**
     * @param  array{intent: string, report_type: string, report_path: string, answer_title: string, empty_account_hint?: string}  $def
     */
    protected function formatFinancialDashboardAnswer(array $def, array $metrics, ?array $dateRange): string
    {
        if (! empty($metrics['error'])) {
            return ($def['answer_title'] ?? 'Balances').' abhi nikaal nahi sakay: '.(string) $metrics['error'];
        }

        $accounts = $metrics['accounts'] ?? [];
        $total = (float) ($metrics['total_closing'] ?? 0);
        $title = (string) ($def['answer_title'] ?? 'Balances');
        $reportPath = (string) ($def['report_path'] ?? '/accounts/dashboard');
        $emptyHint = (string) ($def['empty_account_hint'] ?? 'Is category mein koi mapped account nahi mila.');

        $rangeLabel = $dateRange
            ? "Voucher date filter: {$dateRange['from']} to {$dateRange['to']}"
            : 'Scope: all posted vouchers (accounts dashboard jaisa).';

        $lines = [
            "**{$title}** (live / company + location scope)",
            $rangeLabel,
            (string) ($metrics['as_of_note'] ?? ''),
        ];

        if ($accounts === []) {
            $lines[] = $emptyHint;
            $lines[] = 'Full screen: ['.$title.']('.$reportPath.')';

            return implode("\n", array_filter($lines));
        }

        foreach ($accounts as $row) {
            $code = $row['account_code'] ?? '';
            $name = $row['account_name'] ?? '';
            $bal = number_format((float) ($row['closing_balance'] ?? 0), 2);
            $lines[] = "- `{$code}` {$name}: **{$bal}**";
        }

        $lines[] = '**Total (sum of above):** '.number_format($total, 2);
        $lines[] = 'Detail screen (same logic): ['.$title.']('.$reportPath.')';

        return implode("\n", $lines);
    }

    protected function isAssistedEntryIntent(string $normalized): bool
    {
        return (
            str_contains($normalized, 'prefill') ||
            str_contains($normalized, 'pre-fill') ||
            str_contains($normalized, 'draft') ||
            str_contains($normalized, 'create') ||
            str_contains($normalized, 'entry') ||
            str_contains($normalized, 'banado') ||
            str_contains($normalized, 'bana do')
        ) && (
            str_contains($normalized, 'purchase requisition') ||
            str_contains($normalized, 'purchase order') ||
            str_contains($normalized, 'goods receipt') ||
            str_contains($normalized, 'grn') ||
            str_contains($normalized, 'journal voucher') ||
            str_contains($normalized, 'bank voucher') ||
            str_contains($normalized, 'cash voucher') ||
            str_contains($normalized, 'opening voucher') ||
            str_contains($normalized, 'jv') ||
            str_contains($normalized, 'bpv') ||
            str_contains($normalized, 'brv') ||
            str_contains($normalized, 'cpv') ||
            str_contains($normalized, 'crv') ||
            preg_match('/\bpr\b/u', $normalized) ||
            preg_match('/\bpo\b/u', $normalized)
        );
    }

    protected function buildScopeContext(Request $request): array
    {
        $compIdCandidates = [
            $request->session()->get('user_comp_id'),
            $request->input('user_comp_id'),
            $request->user()?->comp_id,
            $request->input('comp_id'),
            $request->session()->get('comp_id'),
        ];

        $locationCandidates = [
            $request->session()->get('user_location_id'),
            $request->input('user_location_id'),
            $request->user()?->location_id,
            $request->input('location_id'),
            $request->session()->get('location_id'),
        ];

        return [
            'comp_id' => $this->firstPositiveInt($compIdCandidates),
            'location_id' => $this->firstPositiveInt($locationCandidates),
        ];
    }

    protected function extractDateRange(string $text): ?array
    {
        $raw = trim($text);

        if (preg_match('/(\d{4}-\d{2}-\d{2})\s*(to|\-|until|till)\s*(\d{4}-\d{2}-\d{2})/i', $raw, $m)) {
            return ['from' => $m[1], 'to' => $m[3]];
        }

        $lower = mb_strtolower($raw);
        if (str_contains($lower, 'today')) {
            $d = now()->format('Y-m-d');

            return ['from' => $d, 'to' => $d];
        }

        if (str_contains($lower, 'this week')) {
            return [
                'from' => now()->startOfWeek()->format('Y-m-d'),
                'to' => now()->endOfWeek()->format('Y-m-d'),
            ];
        }

        if (str_contains($lower, 'this month')) {
            return [
                'from' => now()->startOfMonth()->format('Y-m-d'),
                'to' => now()->endOfMonth()->format('Y-m-d'),
            ];
        }

        if (str_contains($lower, 'last month')) {
            $lastMonth = now()->subMonthNoOverflow();

            return [
                'from' => $lastMonth->copy()->startOfMonth()->format('Y-m-d'),
                'to' => $lastMonth->copy()->endOfMonth()->format('Y-m-d'),
            ];
        }

        if (preg_match('/\b(\d{4}-\d{2}-\d{2})\b/', $raw, $m)) {
            return ['from' => $m[1], 'to' => $m[1]];
        }

        return null;
    }

    protected function detectLanguageHint(string $text): string
    {
        if (preg_match('/[\x{0600}-\x{06FF}]/u', $text) === 1) {
            return 'ur_mix';
        }

        return 'en';
    }

    protected function outOfScopeRefusalMessage(string $languageHint): string
    {
        $lines = [
            'Main RAHJ AI hoon—main sirf is ERP / business software ke liye train hoon: accounts, inventory, procurement, reports, aur app mein navigation.',
            'Personal sawal (jaise relationship advice), medical mashware / ilaj, ya na-munasib / vulgar content par main madad nahi kar sakta.',
            '',
            'I am only trained to help with this ERP: accounting, inventory, procurement, reports, and using the app. I cannot help with personal, medical, or inappropriate topics.',
            'Please ask something about your business software or the data/workflows it supports.',
        ];

        if ($languageHint === 'ur_mix') {
            return implode("\n", $lines);
        }

        return implode("\n", [
            'I am RAHJ AI, and I am only trained to help with this ERP: accounting, inventory, procurement, reports, and using the application.',
            'I cannot help with personal matters, medical advice, or inappropriate content.',
            'Please ask something about your business software or the data and workflows it supports.',
        ]);
    }

    protected function groqApiConfigured(): bool
    {
        return trim((string) config('services.groq.api_key', '')) !== '';
    }

    protected function groqMissingKeyMessage(Request $request): string
    {
        $locale = (string) $request->session()->get('locale', config('app.locale', 'en'));
        if (! in_array($locale, TranslationLoaderService::LOCALES, true)) {
            $locale = TranslationLoaderService::DEFAULT_LOCALE;
        }

        return (string) trans('rahj_ai_backend.groq_not_configured', [], $locale);
    }

    protected function localResponse(string $answer, array $sources, array $meta, string $languageHint, bool $appendUrduMixOffer = true): array
    {
        $finalAnswer = $answer;
        if ($appendUrduMixOffer && $languageHint === 'ur_mix' && ! str_contains(mb_strtolower($answer), 'urdu')) {
            $finalAnswer .= "\n\nAgar chaho to main isi data ka Urdu + English mix summary bhi de sakta hoon.";
        }

        return [
            'answer' => $finalAnswer,
            'model' => 'local-tools',
            'sources' => $sources,
            'meta' => $meta + ['language_hint' => $languageHint],
        ];
    }

    protected function formatMetricsAnswer(string $intent, array $metrics, ?array $dateRange): string
    {
        $rangeLabel = $dateRange
            ? "Date range: {$dateRange['from']} to {$dateRange['to']}"
            : 'Date range: all available records in your current company/location scope';

        if ($intent === 'receivables') {
            $aging = $metrics['aging'] ?? [];

            return implode("\n", [
                'Receivables snapshot (permission-aware):',
                $rangeLabel,
                'Outstanding invoices: '.($metrics['outstanding_count'] ?? 0),
                'Outstanding amount: '.number_format((float) ($metrics['outstanding_amount'] ?? 0), 2),
                'Aging 0-30 days: '.(($aging['0_30']['count'] ?? 0)).' ('.number_format((float) ($aging['0_30']['amount'] ?? 0), 2).')',
                'Aging 31-60 days: '.(($aging['31_60']['count'] ?? 0)).' ('.number_format((float) ($aging['31_60']['amount'] ?? 0), 2).')',
                'Aging 61-90 days: '.(($aging['61_90']['count'] ?? 0)).' ('.number_format((float) ($aging['61_90']['amount'] ?? 0), 2).')',
                'Aging 90+ days: '.(($aging['90_plus']['count'] ?? 0)).' ('.number_format((float) ($aging['90_plus']['amount'] ?? 0), 2).')',
            ]);
        }

        if ($intent === 'report') {
            $statusLines = array_map(static function (array $row): string {
                return ($row['status'] ?? 'unknown').': '.($row['count'] ?? 0);
            }, $metrics['status_breakdown'] ?? []);

            $voucherLines = array_map(static function (array $row): string {
                return ($row['voucher_type'] ?? 'unknown').': '.($row['count'] ?? 0);
            }, $metrics['top_voucher_types'] ?? []);

            return implode("\n", array_filter([
                'Simple report summary (read-only):',
                $rangeLabel,
                'Transactions: '.($metrics['total_rows'] ?? 0),
                'Total debit: '.number_format((float) ($metrics['total_debit'] ?? 0), 2),
                'Total credit: '.number_format((float) ($metrics['total_credit'] ?? 0), 2),
                ! empty($statusLines) ? 'Status breakdown: '.implode(' | ', $statusLines) : null,
                ! empty($voucherLines) ? 'Top voucher types: '.implode(' | ', $voucherLines) : null,
            ]));
        }

        $pr = $metrics['doc_counts']['purchase_requisitions'] ?? [];
        $po = $metrics['doc_counts']['purchase_orders'] ?? [];
        $grn = $metrics['doc_counts']['goods_receipt_notes'] ?? [];

        return implode("\n", [
            'Inventory/stock flow snapshot (read-only):',
            $rangeLabel,
            'Items total: '.($metrics['items_total'] ?? 0).' | Active: '.($metrics['items_active'] ?? 0),
            'Requested qty: '.number_format((float) ($metrics['requested_qty'] ?? 0), 3),
            'Ordered qty: '.number_format((float) ($metrics['ordered_qty'] ?? 0), 3),
            'Received qty: '.number_format((float) ($metrics['received_qty'] ?? 0), 3),
            'PR statuses: '.$this->kvString($pr),
            'PO statuses: '.$this->kvString($po),
            'GRN statuses: '.$this->kvString($grn),
        ]);
    }

    protected function kvString(array $input): string
    {
        if (empty($input)) {
            return 'none';
        }

        $parts = [];
        foreach ($input as $k => $v) {
            $parts[] = $k.':'.$v;
        }

        return implode(', ', $parts);
    }

    protected function canViewMenuRoute(?User $user, string $menuRoute): bool
    {
        return $this->canAccessMenuRoute($user, $menuRoute, 'can_view');
    }

    protected function canAccessMenuRoute(?User $user, string $menuRoute, string $permission = 'can_view'): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->role === 'super_admin') {
            return true;
        }

        $menu = Menu::query()->where('route', $menuRoute)->first();
        if (! $menu) {
            // Keep compatibility with existing permission trait behavior.
            return true;
        }

        return $user->hasPermission($menu->id, $permission);
    }

    protected function metricsCacheKey(array $scope, string $intent, ?array $dateRange): string
    {
        return 'rahj_ai_metrics_'.md5(json_encode([
            'comp_id' => $scope['comp_id'] ?? null,
            'location_id' => $scope['location_id'] ?? null,
            'intent' => $intent,
            'date_range' => $dateRange,
        ]));
    }

    protected function pendingKey(Request $request, ?int $conversationId): string
    {
        $userId = (int) ($request->user()?->id ?? $request->session()->get('user_id') ?? 0);
        $conversationPart = $conversationId ? (string) $conversationId : 'none';

        return 'rahj_ai_pending_'.$userId.'_'.$conversationPart;
    }

    protected function savePendingClarification(Request $request, ?int $conversationId, array $data): void
    {
        Cache::put($this->pendingKey($request, $conversationId), $data, now()->addMinutes(10));
    }

    protected function getPendingClarification(Request $request, ?int $conversationId): ?array
    {
        $value = Cache::get($this->pendingKey($request, $conversationId));

        return is_array($value) ? $value : null;
    }

    protected function clearPendingClarification(Request $request, ?int $conversationId): void
    {
        Cache::forget($this->pendingKey($request, $conversationId));
    }

    /**
     * @return list<array{code: string, name: string, account_type: string|null}>
     */
    protected function suggestLevel3ParentsForCoa(int $compId, int $locationId, string $question): array
    {
        $lower = mb_strtolower($question);
        $bankish = str_contains($lower, 'bank')
            || str_contains($lower, 'banks')
            || str_contains($lower, 'cash')
            || str_contains($lower, 'alfalah')
            || str_contains($lower, 'hbl')
            || str_contains($lower, 'ubl')
            || str_contains($lower, 'mcb');

        $base = DB::table('chart_of_accounts')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3);

        if ($bankish) {
            $filtered = (clone $base)
                ->where(function ($q): void {
                    $q->where('account_name', 'like', '%bank%')
                        ->orWhere('account_name', 'like', '%Bank%')
                        ->orWhere('account_name', 'like', '%cash%')
                        ->orWhere('account_name', 'like', '%Cash%')
                        ->orWhere('account_type', 'Asset');
                })
                ->orderBy('account_code')
                ->limit(12)
                ->get(['account_code', 'account_name', 'account_type']);

            if ($filtered->isNotEmpty()) {
                return $filtered->map(static function ($row): array {
                    return [
                        'code' => (string) $row->account_code,
                        'name' => (string) $row->account_name,
                        'account_type' => isset($row->account_type) ? (string) $row->account_type : null,
                    ];
                })->all();
            }
        }

        return $base->orderBy('account_code')
            ->limit(12)
            ->get(['account_code', 'account_name', 'account_type'])
            ->map(static function ($row): array {
                return [
                    'code' => (string) $row->account_code,
                    'name' => (string) $row->account_name,
                    'account_type' => isset($row->account_type) ? (string) $row->account_type : null,
                ];
            })->all();
    }

    protected function handleSmartCoaCodeEntry(
        string $question,
        array $context,
        ?User $user,
        Request $request,
        ?int $conversationId,
        string $languageHint,
        SmartEntryService $smartEntry
    ): ?array {
        if (! $context['comp_id'] || ! $context['location_id']) {
            $this->savePendingClarification($request, $conversationId, [
                'intent' => 'smart_entry_scope_missing',
                'question' => $question,
            ]);

            return $this->localResponse(
                'I can help create a COA Level 4 code. First, please confirm your company and location (auto-selected if available).',
                [],
                ['mode' => 'clarification', 'needs' => ['company', 'location']],
                $languageHint
            );
        }

        $extracted = $smartEntry->extractCoaCodeParams($question);
        $level3AccountId = null;

        // If parent code provided, try to resolve it
        if ($extracted['parent_code']) {
            $level3Account = DB::table('chart_of_accounts')
                ->where('account_code', $extracted['parent_code'])
                ->where('comp_id', $context['comp_id'])
                ->where('location_id', $context['location_id'])
                ->where('account_level', 3)
                ->first();

            if ($level3Account) {
                $level3AccountId = $level3Account->id;
            }
        }

        $level3Suggestions = $this->suggestLevel3ParentsForCoa(
            (int) $context['comp_id'],
            (int) $context['location_id'],
            $question
        );

        // Check permissions
        if (! $this->canAccessMenuRoute($user, '/accounts/chart-of-account-code-configuration', 'can_add')) {
            return $this->localResponse(
                'You don\'t have permission to create COA codes. Please contact your administrator.',
                [],
                ['mode' => 'smart_entry', 'permission' => 'denied'],
                $languageHint
            );
        }

        $smartResponse = $smartEntry->buildCoaCodeSmartResponse(
            $question,
            $extracted,
            $level3AccountId,
            $languageHint,
            $level3Suggestions
        );

        if ($smartResponse['mode'] === 'smart_entry_field_collection') {
            $this->savePendingClarification($request, $conversationId, [
                'intent' => 'smart_entry_coa_field_collection',
                'extracted' => $smartResponse['extracted'],
                'missing_fields' => $smartResponse['missing_fields'],
                'level3_account_id' => $level3AccountId,
            ]);

            return $this->localResponse(
                $smartResponse['answer'],
                [],
                [
                    'mode' => 'smart_entry',
                    'step' => 'field_collection',
                    'action' => $smartResponse['input_form'] ?? null,
                ],
                $languageHint
            );
        }

        if ($smartResponse['mode'] === 'smart_entry_ready_confirmation') {
            $level3ForPending = $level3AccountId;
            if (! $level3ForPending && ! empty($smartResponse['extracted']['parent_code'])) {
                $resolvedParent = DB::table('chart_of_accounts')
                    ->where('account_code', $smartResponse['extracted']['parent_code'])
                    ->where('comp_id', $context['comp_id'])
                    ->where('location_id', $context['location_id'])
                    ->where('account_level', 3)
                    ->first();
                if ($resolvedParent) {
                    $level3ForPending = (int) $resolvedParent->id;
                }
            }

            $this->savePendingClarification($request, $conversationId, [
                'intent' => 'smart_entry_coa_ready_confirmation',
                'extracted' => $smartResponse['extracted'],
                'level3_account_id' => $level3ForPending,
                'comp_id' => $context['comp_id'],
                'location_id' => $context['location_id'],
            ]);

            return $this->localResponse(
                $smartResponse['answer'],
                [],
                ['mode' => 'smart_entry', 'step' => 'confirmation', 'action' => $smartResponse['action'] ?? null],
                $languageHint
            );
        }

        return null;
    }

    protected function tryResolveSmartEntryFlow(
        string $question,
        array $pending,
        array $context,
        ?User $user,
        SmartEntryService $smartEntry,
        ?int $conversationId,
        Request $request,
        string $languageHint
    ): ?array {
        $intent = $pending['intent'] ?? null;

        if ($intent === 'smart_entry_coa_field_collection') {
            $resolved = $smartEntry->tryResolveSmartEntryFieldCollection($question, $pending);
            if ($resolved === null) {
                return null;
            }

            $extracted = $resolved['extracted'];
            $level3AccountId = $pending['level3_account_id'] ?? null;
            if (! $level3AccountId && ! empty($extracted['parent_code'])) {
                $parentRow = DB::table('chart_of_accounts')
                    ->where('account_code', $extracted['parent_code'])
                    ->where('comp_id', $context['comp_id'])
                    ->where('location_id', $context['location_id'])
                    ->where('account_level', 3)
                    ->first();
                if ($parentRow) {
                    $level3AccountId = (int) $parentRow->id;
                }
            }

            $suggestions = $this->suggestLevel3ParentsForCoa(
                (int) $context['comp_id'],
                (int) $context['location_id'],
                $question
            );

            if (! ($resolved['complete'] ?? false)) {
                $smartResponse = $smartEntry->buildCoaCodeSmartResponse(
                    $question,
                    $extracted,
                    $level3AccountId,
                    $languageHint,
                    $suggestions
                );

                $this->savePendingClarification($request, $conversationId, [
                    'intent' => 'smart_entry_coa_field_collection',
                    'extracted' => $smartResponse['extracted'],
                    'missing_fields' => $resolved['missing_fields'] ?? [],
                    'level3_account_id' => $level3AccountId,
                ]);

                return $this->localResponse(
                    $smartResponse['answer'],
                    [],
                    [
                        'mode' => 'smart_entry',
                        'step' => 'field_collection',
                        'action' => $smartResponse['input_form'] ?? null,
                    ],
                    $languageHint
                );
            }

            $smartResponse = $smartEntry->buildCoaCodeSmartResponse(
                $question,
                $extracted,
                $level3AccountId,
                $languageHint,
                $suggestions
            );

            $level3ForPending = $level3AccountId;
            if (! $level3ForPending && ! empty($smartResponse['extracted']['parent_code'])) {
                $resolvedParent = DB::table('chart_of_accounts')
                    ->where('account_code', $smartResponse['extracted']['parent_code'])
                    ->where('comp_id', $context['comp_id'])
                    ->where('location_id', $context['location_id'])
                    ->where('account_level', 3)
                    ->first();
                if ($resolvedParent) {
                    $level3ForPending = (int) $resolvedParent->id;
                }
            }

            $this->clearPendingClarification($request, $conversationId);
            $this->savePendingClarification($request, $conversationId, [
                'intent' => 'smart_entry_coa_ready_confirmation',
                'extracted' => $smartResponse['extracted'],
                'level3_account_id' => $level3ForPending,
                'comp_id' => $context['comp_id'],
                'location_id' => $context['location_id'],
            ]);

            return $this->localResponse(
                $smartResponse['answer'],
                [],
                ['mode' => 'smart_entry', 'step' => 'confirmation', 'action' => $smartResponse['action'] ?? null],
                $languageHint
            );
        }

        if ($intent === 'smart_entry_coa_ready_confirmation') {
            if ($smartEntry->isSmartEntryConfirmation($question)) {
                $extracted = $pending['extracted'] ?? [];
                $level3AccountId = $pending['level3_account_id'] ?? null;
                $compId = $pending['comp_id'] ?? $context['comp_id'];
                $locationId = $pending['location_id'] ?? $context['location_id'];

                $this->clearPendingClarification($request, $conversationId);

                return $this->executeSmartCoaCodeCreation(
                    $extracted,
                    $level3AccountId,
                    $compId,
                    $locationId,
                    $user,
                    $languageHint
                );
            }
        }

        return null;
    }

    protected function executeSmartCoaCodeCreation(
        array $extracted,
        ?int $level3AccountId,
        int $compId,
        int $locationId,
        ?User $user,
        string $languageHint
    ): array {
        // Resolve parent account if needed
        if (! $level3AccountId && $extracted['parent_code']) {
            $parentAccount = DB::table('chart_of_accounts')
                ->where('account_code', $extracted['parent_code'])
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('account_level', 3)
                ->first();

            if (! $parentAccount) {
                return $this->localResponse(
                    "Parent Level 3 account not found: {$extracted['parent_code']}. Please verify the code and try again.",
                    [],
                    ['mode' => 'smart_entry', 'step' => 'error', 'error_type' => 'parent_not_found'],
                    $languageHint
                );
            }

            $level3AccountId = $parentAccount->id;
        }

        if (! $level3AccountId) {
            return $this->localResponse(
                'Parent Level 3 account not specified. Please provide the parent account code.',
                [],
                ['mode' => 'smart_entry', 'step' => 'error', 'error_type' => 'parent_missing'],
                $languageHint
            );
        }

        $parentAccountType = (string) (DB::table('chart_of_accounts')
            ->where('id', $level3AccountId)
            ->value('account_type') ?? '');

        $accountType = $this->normalizeChartOfAccountsTypeForInsert(
            isset($extracted['account_type']) ? (string) $extracted['account_type'] : null,
            $parentAccountType !== '' ? $parentAccountType : null
        );

        $typeLabelForMessage = trim((string) ($extracted['account_type'] ?? '')) !== ''
            ? (string) $extracted['account_type']
            : $accountType;

        $existingCode = DB::table('chart_of_accounts')
            ->where('account_code', $extracted['account_code'])
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->exists();

        if ($existingCode) {
            return $this->localResponse(
                "Account code '{$extracted['account_code']}' already exists for this company/location. Please use a different code.",
                [],
                ['mode' => 'smart_entry', 'step' => 'error', 'error_type' => 'duplicate_code'],
                $languageHint
            );
        }

        DB::beginTransaction();
        try {
            $newCode = DB::table('chart_of_accounts')->insertGetId([
                'account_code' => $extracted['account_code'],
                'account_name' => $extracted['account_name'],
                'account_type' => $accountType,
                'parent_account_id' => $level3AccountId,
                'account_level' => 4,
                'is_transactional' => $extracted['is_transactional'] ?? true,
                'currency' => 'PKR',
                'status' => 'Active',
                'comp_id' => $compId,
                'location_id' => $locationId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            $answer = "✓ **Level 4 account code created successfully!**\n\n";
            $answer .= "- Code: **{$extracted['account_code']}**\n";
            $answer .= "- Name: **{$extracted['account_name']}**\n";
            $answer .= $typeLabelForMessage === $accountType
                ? "- Type: **{$accountType}**\n"
                : "- Type: **{$typeLabelForMessage}** (database value **{$accountType}**)\n";
            $answer .= '- Transactional: **'.($extracted['is_transactional'] ? 'Yes' : 'No')."**\n\n";
            $answer .= 'You can now use this code in journal entries, transactions, and reports.';

            return $this->localResponse(
                $answer,
                [[
                    'source_type' => 'smart_entry_action',
                    'source_path' => '/accounts/chart-of-account-code-configuration',
                    'document_title' => 'COA Code Auto-Created',
                    'section_title' => 'Smart Entry Execution',
                ]],
                [
                    'mode' => 'smart_entry',
                    'step' => 'completed',
                    'created_code_id' => $newCode,
                    'extracted_data' => $extracted,
                ],
                $languageHint
            );

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Smart entry COA code creation failed', [
                'error' => $e->getMessage(),
                'extracted' => $extracted,
            ]);

            return $this->localResponse(
                'Failed to create account code. Error: '.$e->getMessage(),
                [],
                ['mode' => 'smart_entry', 'step' => 'error', 'error_type' => 'execution_failed'],
                $languageHint
            );
        }
    }

    /**
     * chart_of_accounts.account_type is often a MySQL ENUM with plural values (Assets, Liabilities, Expenses).
     * Smart entry and forms use singular (Asset, …). Normalize before raw DB::insert.
     */
    protected function normalizeChartOfAccountsTypeForInsert(?string $fromUser, ?string $fromParentRow): string
    {
        $db = $this->mapCoaAccountTypeToDbEnum($fromUser)
            ?? $this->mapCoaAccountTypeToDbEnum($fromParentRow);

        return $db ?? 'Assets';
    }

    protected function mapCoaAccountTypeToDbEnum(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }
        $t = trim($raw);
        if ($t === '') {
            return null;
        }

        static $map = [
            'Asset' => 'Assets',
            'Assets' => 'Assets',
            'Liability' => 'Liabilities',
            'Liabilities' => 'Liabilities',
            'Expense' => 'Expenses',
            'Expenses' => 'Expenses',
            'Equity' => 'Equity',
            'Revenue' => 'Revenue',
            'Contra-Asset' => 'Assets',
            'Contra-Revenue' => 'Revenue',
        ];

        return $map[$t] ?? null;
    }

    protected function tryResolvePendingClarification(string $question, array $pending, array $scope, ?User $user): ?array
    {
        $intent = (string) ($pending['intent'] ?? '');

        if ($intent === 'report') {
            $dateRange = $this->extractDateRange($question);
            if ($dateRange === null) {
                return null;
            }

            if (! $this->canViewMenuRoute($user, '/accounts/dashboard')) {
                return [
                    'answer' => 'Permission denied for report view. Please contact your administrator.',
                    'sources' => [],
                    'meta' => [
                        'mode' => 'clarification_resolved',
                        'permission' => 'denied',
                    ],
                ];
            }

            if (! $scope['comp_id'] || ! $scope['location_id']) {
                return [
                    'answer' => 'I still need company and location context to run this report.',
                    'sources' => [],
                    'meta' => [
                        'mode' => 'clarification',
                        'needs' => ['company', 'location'],
                    ],
                ];
            }

            $metrics = $this->simpleReport((int) $scope['comp_id'], (int) $scope['location_id'], $dateRange);

            return [
                'answer' => $this->formatMetricsAnswer('report', $metrics, $dateRange),
                'sources' => [[
                    'source_type' => 'application_tool',
                    'source_path' => '/accounts/dashboard',
                    'document_title' => 'Permission-aware read-only tool',
                    'section_title' => 'Phase D clarification',
                    'table_name' => null,
                ]],
                'meta' => [
                    'mode' => 'clarification_resolved',
                    'intent' => 'report',
                    'date_range' => $dateRange,
                ],
            ];
        }

        return null;
    }

    protected function firstPositiveInt(array $candidates): ?int
    {
        foreach ($candidates as $value) {
            if (is_numeric($value) && (int) $value > 0) {
                return (int) $value;
            }
        }

        return null;
    }

    protected function draftSources(string $route): array
    {
        return [[
            'source_type' => 'application_tool',
            'source_path' => $route,
            'document_title' => 'Assisted entry draft',
            'section_title' => 'Phase C',
            'table_name' => null,
        ]];
    }

    protected function draftPermissionDenied(string $target, string $languageHint): array
    {
        return $this->localResponse(
            'You do not have create permission for '.$target.'. Please contact your administrator.',
            [],
            [
                'mode' => 'assisted_entry',
                'permission' => 'denied',
            ],
            $languageHint
        );
    }
}
