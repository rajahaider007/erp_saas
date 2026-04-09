<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\Cache;

class RagCorpusService
{
    public function retrieve(string $query, int $topK = 5): array
    {
        $records = $this->loadCorpus();
        if (empty($records)) {
            return [];
        }

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
        $cacheKey = 'rahj_ai_rag_corpus_' . md5($path);
        $ttlSeconds = (int) config('services.groq.rag_cache_seconds', 300);

        return Cache::remember($cacheKey, now()->addSeconds(max($ttlSeconds, 30)), function () use ($path) {
            if (!is_file($path) || !is_readable($path)) {
                return [];
            }

            $rows = [];
            $fh = fopen($path, 'r');
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
                    $rows[] = $decoded;
                }
            }

            fclose($fh);

            return $rows;
        });
    }

    protected function score(array $queryTokens, string $content, array $record): float
    {
        $haystack = mb_strtolower($content);
        $matched = 0;
        $densityBoost = 0.0;

        foreach ($queryTokens as $token) {
            if (str_contains($haystack, $token)) {
                $matched++;
                $densityBoost += min(3, substr_count($haystack, $token)) * 0.2;
            }
        }

        if ($matched === 0) {
            return 0.0;
        }

        $coverage = $matched / max(1, count($queryTokens));
        $sourceBoost = (($record['source_type'] ?? '') === 'database_schema' && $this->looksLikeDbQuery($queryTokens)) ? 0.25 : 0.0;

        return ($coverage * 1.2) + $densityBoost + $sourceBoost;
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

        return array_values(array_unique($parts));
    }
}
