<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\Cache;

class RagCorpusService
{
    protected const STOP_WORDS = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'do', 'for', 'from', 'how', 'i', 'in', 'is', 'it',
        'me', 'many', 'module', 'my', 'of', 'on', 'or', 'our', 'please', 'show', 'the', 'this', 'to', 'we',
        'what', 'when', 'where', 'which', 'with', 'you', 'your', 'kya', 'ka', 'ki', 'ke', 'hain', 'hai',
    ];

    protected const DOMAIN_KEYWORDS = [
        'accounts' => ['account', 'accounts', 'coa', 'chart', 'ledger', 'journal', 'voucher', 'trial', 'balance'],
        'inventory' => ['inventory', 'stock', 'warehouse', 'item', 'items', 'grn', 'po', 'pr', 'purchase'],
        'reports' => ['report', 'reports', 'summary', 'summaries', 'dashboard'],
    ];

    public function retrieve(string $query, int $topK = 5): array
    {
        $records = $this->loadCorpus();
        if (empty($records)) {
            return [];
        }

        $query = $this->expandQueryForRetrieval($query);
        $queryTokens = $this->tokenize($query);
        if (empty($queryTokens)) {
            return array_slice($records, 0, $topK);
        }

        $scored = [];
        foreach ($records as $record) {
            $content = (string) ($record['content'] ?? '');
            if ($content === '') {
                continue;
            }

            $score = $this->score($queryTokens, $content, $record);
            if ($score <= 0) {
                continue;
            }

            $record['_score'] = $score;
            $scored[] = $record;
        }

        usort($scored, static function (array $a, array $b): int {
            return ($b['_score'] ?? 0) <=> ($a['_score'] ?? 0);
        });

        $top = array_slice($scored, 0, $topK);
        foreach ($top as &$row) {
            unset($row['_score']);
        }

        return $top;
    }

    protected function loadCorpus(): array
    {
        $path = base_path(config('services.groq.rag_chunks_path', 'docs/rag/langchain_chunks.jsonl'));
        $overlayPath = base_path('docs/rag/artisan_schema_overlay.jsonl');
        $mtime = (@filemtime($path) ?: 0).':'.(@filemtime($overlayPath) ?: 0);
        $cacheKey = 'rahj_ai_rag_corpus_'.md5($path.'|'.$overlayPath.'|'.$mtime);
        $ttlSeconds = (int) config('services.groq.rag_cache_seconds', 300);

        // Corpus can be many MB serialized; database `cache.value` is MEDIUMTEXT and will truncate.
        return Cache::store('file')->remember($cacheKey, now()->addSeconds(max($ttlSeconds, 30)), function () use ($path, $overlayPath) {
            $readJsonl = static function (string $filePath): array {
                if (! is_file($filePath) || ! is_readable($filePath)) {
                    return [];
                }
                $out = [];
                $fh = fopen($filePath, 'r');
                if ($fh === false) {
                    return [];
                }
                while (($line = fgets($fh)) !== false) {
                    $line = trim($line);
                    if ($line === '') {
                        continue;
                    }
                    $decoded = json_decode($line, true);
                    if (is_array($decoded)) {
                        $out[] = $decoded;
                    }
                }
                fclose($fh);

                return $out;
            };

            return array_merge($readJsonl($path), $readJsonl($overlayPath));
        });
    }

    protected function score(array $queryTokens, string $content, array $record): float
    {
        $contentHaystack = mb_strtolower($content);
        $pathHaystack = mb_strtolower((string) ($record['source_path'] ?? ''));
        $titleHaystack = mb_strtolower((string) ($record['document_title'] ?? ''));
        $sectionHaystack = mb_strtolower((string) ($record['section_title'] ?? ''));
        $tagsHaystack = mb_strtolower(implode(' ', (array) ($record['tags'] ?? [])));

        $domain = $this->detectDomain($queryTokens);
        $matched = 0;
        $densityBoost = 0.0;
        $importantMatched = 0;

        $importantTokens = array_values(array_filter($queryTokens, static function (string $token): bool {
            return strlen($token) >= 4;
        }));

        foreach ($queryTokens as $token) {
            $inContent = str_contains($contentHaystack, $token);
            $inMeta = str_contains($pathHaystack, $token)
                || str_contains($titleHaystack, $token)
                || str_contains($sectionHaystack, $token)
                || str_contains($tagsHaystack, $token);

            if ($inContent || $inMeta) {
                $matched++;

                if ($inContent) {
                    $densityBoost += min(3, substr_count($contentHaystack, $token)) * 0.16;
                }

                if ($inMeta) {
                    $densityBoost += 0.22;
                }

                if (strlen($token) >= 4) {
                    $importantMatched++;
                }
            }
        }

        if ($matched === 0) {
            return 0.0;
        }

        // Avoid generic matches dominating when meaningful tokens are present.
        if (! empty($importantTokens) && $importantMatched === 0) {
            return 0.0;
        }

        $coverage = $matched / max(1, count($queryTokens));

        $sourceType = (string) ($record['source_type'] ?? '');
        $sourceBoost = 0.0;

        if ($sourceType === 'database_schema' && $this->looksLikeDbQuery($queryTokens)) {
            $sourceBoost += 0.25;
        }

        if ($sourceType === 'user_guide') {
            $sourceBoost += 0.18;
        }

        if (str_contains($pathHaystack, 'navigation_anchors')) {
            $sourceBoost += 0.28;
        }

        if (str_contains($pathHaystack, 'route_catalog')) {
            // Broad route lists: keep a small boost so navigation still surfaces, but below module guides.
            $sourceBoost += 0.06;
        }

        if ($domain !== null) {
            $sourceBoost += $this->domainBoost($domain, $pathHaystack, $titleHaystack, $sectionHaystack, $tagsHaystack);
        }

        return ($coverage * 1.2) + $densityBoost + $sourceBoost;
    }

    protected function detectDomain(array $tokens): ?string
    {
        $bestDomain = null;
        $bestCount = 0;

        foreach (self::DOMAIN_KEYWORDS as $domain => $keywords) {
            $count = 0;
            foreach ($tokens as $token) {
                if (in_array($token, $keywords, true)) {
                    $count++;
                }
            }

            if ($count > $bestCount) {
                $bestCount = $count;
                $bestDomain = $domain;
            }
        }

        return $bestCount > 0 ? $bestDomain : null;
    }

    protected function domainBoost(
        string $domain,
        string $pathHaystack,
        string $titleHaystack,
        string $sectionHaystack,
        string $tagsHaystack
    ): float {
        $combined = $pathHaystack.' '.$titleHaystack.' '.$sectionHaystack.' '.$tagsHaystack;

        $domainKeywords = self::DOMAIN_KEYWORDS[$domain] ?? [];
        $otherKeywords = [];
        foreach (self::DOMAIN_KEYWORDS as $name => $keywords) {
            if ($name === $domain) {
                continue;
            }
            $otherKeywords = array_merge($otherKeywords, $keywords);
        }

        $boost = 0.0;
        foreach ($domainKeywords as $keyword) {
            if (str_contains($combined, $keyword)) {
                $boost += 0.08;
            }
        }

        $crossDomainHits = 0;
        foreach (array_unique($otherKeywords) as $keyword) {
            if (str_contains($combined, $keyword)) {
                $crossDomainHits++;
            }
        }

        if ($crossDomainHits >= 2) {
            $boost -= 0.18;
        }

        return max(-0.25, min(0.45, $boost));
    }

    protected function looksLikeDbQuery(array $tokens): bool
    {
        $dbHints = ['table', 'column', 'schema', 'sql', 'database', 'query', 'account', 'ledger'];
        foreach ($tokens as $token) {
            if (in_array($token, $dbHints, true)) {
                return true;
            }
        }

        return false;
    }

    protected function tokenize(string $text): array
    {
        $parts = preg_split('/[^a-zA-Z0-9_]+/u', mb_strtolower($text));
        $parts = array_values(array_filter($parts, static function ($token) {
            return is_string($token) && strlen($token) >= 2;
        }));

        $parts = array_values(array_filter($parts, static function (string $token): bool {
            if (in_array($token, self::STOP_WORDS, true)) {
                return false;
            }

            // Drop mostly numeric fragments that add noise in lexical matching.
            return ! preg_match('/^\d+$/', $token);
        }));

        return array_values(array_unique($parts));
    }

    /**
     * Light query expansion for lexical retrieval (Roman Urdu / shorthand → extra English tokens).
     */
    protected function expandQueryForRetrieval(string $query): string
    {
        $lower = mb_strtolower(trim($query));
        $extra = [];

        if (preg_match('/\bpo\b|\bp\.o\.|purchase order|purchase orders/i', $query)) {
            $extra[] = 'purchase order pending status inventory';
        }
        if (preg_match('/\bgrn\b|goods receipt|goods received/i', $query)) {
            $extra[] = 'goods receipt note grn inventory';
        }
        if (preg_match('/\bpr\b|purchase requisition|requisition/i', $query) && ! str_contains($lower, 'report')) {
            $extra[] = 'purchase requisition inventory';
        }
        if (preg_match('/journal voucher|\bjv\b/i', $query)) {
            $extra[] = 'journal voucher accounts';
        }
        if (preg_match('/bank voucher|\bbpv\b|\bbrv\b/i', $query)) {
            $extra[] = 'bank voucher accounts';
        }
        if (preg_match('/cash voucher|\bcpv\b|\bcrv\b/i', $query)) {
            $extra[] = 'cash voucher accounts';
        }
        if (preg_match('/voucher|journal|ledger|trial balance|chart of account/i', $query)) {
            $extra[] = 'accounts module';
        }

        if ($extra === []) {
            return $query;
        }

        return trim($query.' '.implode(' ', array_unique($extra)));
    }
}
