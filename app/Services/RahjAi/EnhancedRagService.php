<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Enhanced RAG Service - Combines static knowledge + real-time data
 * 
 * Improvements:
 * 1. Domain-aware retrieval
 * 2. Real-time data injection
 * 3. Better relevance scoring
 * 4. Semantic similarity
 */
class EnhancedRagService
{
    private RealtimeDataService $realtime;
    private RagCorpusService $corpus;

    public function __construct(RealtimeDataService $realtime, RagCorpusService $corpus)
    {
        $this->realtime = $realtime;
        $this->corpus = $corpus;
    }

    /**
     * Intelligent retrieve - combines static + live data
     */
    public function intelligentRetrieve(
        string $query,
        int $companyId,
        int $locationId,
        int $topK = 5
    ): array {
        $intent = $this->detectQueryIntent($query);
        
        // Get static knowledge from RAG corpus
        $staticChunks = $this->corpus->retrieve($query, $topK);

        // Inject real-time data relevant to intent
        $realtimeData = $this->injectRealtimeData($intent, $query, $companyId, $locationId);

        // Merge and re-rank
        $merged = array_merge($staticChunks, $realtimeData);
        $ranked = $this->rankByRelevance($query, $merged);

        return array_slice($ranked, 0, $topK);
    }

    /**
     * Detect user's query intent
     */
    protected function detectQueryIntent(string $query): string
    {
        $normalized = mb_strtolower($query);

        if (preg_match('/bal|statement|trial|ledger|account balance/i', $normalized)) {
            return 'account_balance';
        }
        if (preg_match('/stock|inventory|warehouse|qty|quantity|item/i', $normalized)) {
            return 'inventory_status';
        }
        if (preg_match('/pending|purchase order|po|approve/i', $normalized)) {
            return 'pending_orders';
        }
        if (preg_match('/receipt|grn|received|goods/i', $normalized)) {
            return 'goods_receipt';
        }
        if (preg_match('/sale|sales|order|customer/i', $normalized)) {
            return 'sales_summary';
        }
        if (preg_match('/create|add|new|setup|code/i', $normalized)) {
            return 'entry_guidance';
        }

        return 'general_knowledge';
    }

    /**
     * Inject real-time data based on query intent
     */
    protected function injectRealtimeData(
        string $intent,
        string $query,
        int $companyId,
        int $locationId
    ): array {
        $today = now()->format('Y-m-d');
        $realtimeChunks = [];

        switch ($intent) {
            case 'account_balance':
                $accountCode = $this->extractAccountCode($query);
                if ($accountCode) {
                    $balance = $this->realtime->getAccountBalance($accountCode, $today, $companyId);
                    $realtimeChunks[] = $this->createDataChunk(
                        'realtime_data',
                        "Account {$accountCode} Balance",
                        json_encode($balance)
                    );
                }
                break;

            case 'inventory_status':
                $itemCode = $this->extractItemCode($query);
                if ($itemCode) {
                    $stock = $this->realtime->getInventoryStock($itemCode, null, $companyId);
                    $realtimeChunks[] = $this->createDataChunk(
                        'realtime_data',
                        "Inventory: {$itemCode}",
                        json_encode($stock)
                    );
                }
                break;

            case 'pending_orders':
                $pending = $this->realtime->getPendingPurchaseOrders($companyId, $locationId);
                $realtimeChunks[] = $this->createDataChunk(
                    'realtime_data',
                    'Pending Purchase Orders',
                    json_encode($pending)
                );
                break;

            case 'goods_receipt':
                $receipts = $this->realtime->getPendingGoodsReceipts($companyId);
                $realtimeChunks[] = $this->createDataChunk(
                    'realtime_data',
                    'Pending GRNs',
                    json_encode($receipts)
                );
                break;

            case 'sales_summary':
                $fromDate = $this->extractFromDate($query) ?? now()->subDays(30)->format('Y-m-d');
                $toDate = $this->extractToDate($query) ?? $today;
                $sales = $this->realtime->getSalesSummary($fromDate, $toDate, $companyId);
                $realtimeChunks[] = $this->createDataChunk(
                    'realtime_data',
                    'Sales Summary',
                    json_encode($sales)
                );
                break;
        }

        return $realtimeChunks;
    }

    /**
     * Rank all chunks by relevance to query
     */
    protected function rankByRelevance(string $query, array $chunks): array
    {
        $scored = [];

        foreach ($chunks as $chunk) {
            $score = $this->calculateRelevance($query, $chunk);
            $chunk['_relevance_score'] = $score;
            $scored[] = $chunk;
        }

        usort($scored, fn($a, $b) => ($b['_relevance_score'] ?? 0) <=> ($a['_relevance_score'] ?? 0));

        return $scored;
    }

    /**
     * Calculate relevance score (0-100)
     */
    protected function calculateRelevance(string $query, array $chunk): float
    {
        $queryTokens = $this->tokenize($query);
        $contentTokens = $this->tokenize($chunk['content'] ?? '');

        // Lexical overlap
        $overlap = count(array_intersect($queryTokens, $contentTokens));
        $lexicalScore = ($overlap / max(1, count($queryTokens))) * 50;

        // Boost realtime data
        $sourceBoost = ($chunk['source_type'] === 'realtime_data') ? 30 : 10;

        // Title match boost
        $titleMatch = 0;
        if (isset($chunk['document_title'])) {
            foreach ($queryTokens as $token) {
                if (stripos($chunk['document_title'], $token) !== false) {
                    $titleMatch += 10;
                }
            }
        }

        return min(100, $lexicalScore + $sourceBoost + $titleMatch);
    }

    /**
     * Extract account code from query
     */
    protected function extractAccountCode(string $query): ?string
    {
        if (preg_match('/\b([A-Z0-9]{3,20})\b.*\b(?:account|balance|code)\b/i', $query, $m)) {
            return strtoupper($m[1]);
        }

        return null;
    }

    /**
     * Extract item code from query
     */
    protected function extractItemCode(string $query): ?string
    {
        if (preg_match('/item\s+(\w+)|stock\s+(\w+)|(\d{4,})/i', $query, $m)) {
            return $m[1] ?? $m[2] ?? $m[3];
        }

        return null;
    }

    /**
     * Extract date ranges
     */
    protected function extractFromDate(string $query): ?string
    {
        if (preg_match('/from\s+(\d{4}-\d{2}-\d{2})/i', $query, $m)) {
            return $m[1];
        }

        return null;
    }

    protected function extractToDate(string $query): ?string
    {
        if (preg_match('/to\s+(\d{4}-\d{2}-\d{2})|until\s+(\d{4}-\d{2}-\d{2})/i', $query, $m)) {
            return $m[1] ?? $m[2];
        }

        return null;
    }

    /**
     * Create a data chunk from realtime information
     */
    protected function createDataChunk(string $sourceType, string $title, string $content): array
    {
        return [
            'source_type' => $sourceType,
            'source_path' => 'system::realtime',
            'document_title' => $title,
            'section_title' => 'Real-time Data',
            'content' => $content,
            'table_name' => null,
            'timestamp' => now()->toDateTimeString(),
        ];
    }

    /**
     * Simple tokenizer
     */
    protected function tokenize(string $text): array
    {
        $text = mb_strtolower($text);
        $tokens = preg_split('/[^a-z0-9_\u0600-\u06FF]+/u', $text, -1, PREG_SPLIT_NO_EMPTY);

        return array_filter($tokens, fn($t) => strlen($t) >= 2);
    }
}
