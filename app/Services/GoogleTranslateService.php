<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Unofficial Google Translate (web) - translates text to Urdu.
 * Uses translate.googleapis.com - no API key required.
 */
class GoogleTranslateService
{
    protected string $baseUrl = 'https://translate.googleapis.com/translate_a/single';

    protected int $batchSize = 50;

    protected int $delayMs = 200;

    /**
     * Check if text is mostly English (Latin script).
     */
    public static function isEnglish(string $text): bool
    {
        if (trim($text) === '') {
            return false;
        }
        $latin = preg_match('/[a-zA-Z]/u', $text);
        $arabicUrdu = preg_match('/[\x{0600}-\x{06FF}]/u', $text);
        $length = mb_strlen($text);
        if ($length === 0) {
            return false;
        }
        $latinCount = preg_match_all('/[a-zA-Z]/u', $text);
        $arabicCount = preg_match_all('/[\x{0600}-\x{06FF}]/u', $text);
        return $latinCount > $arabicCount;
    }

    /**
     * Translate a single string from English to Urdu.
     */
    public function translate(string $text): string
    {
        $text = trim($text);
        if ($text === '') {
            return '';
        }
        if (! self::isEnglish($text)) {
            return $text;
        }

        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ])->get($this->baseUrl, [
            'client' => 'gtx',
            'sl' => 'en',
            'tl' => 'ur',
            'dt' => 't',
            'q' => $text,
        ]);

        if (! $response->successful()) {
            return $text;
        }

        $body = $response->body();
        $decoded = json_decode($body, true);
        if (! is_array($decoded) || empty($decoded[0])) {
            return $text;
        }

        $out = '';
        foreach ($decoded[0] as $part) {
            if (isset($part[0]) && is_string($part[0])) {
                $out .= $part[0];
            }
        }

        return $out !== '' ? $out : $text;
    }

    /**
     * Translate multiple strings in one go (batch). Returns array of translated strings.
     */
    public function translateBatch(array $texts): array
    {
        $results = [];
        $chunks = array_chunk($texts, $this->batchSize, true);

        foreach ($chunks as $chunk) {
            $translated = $this->requestBatch(array_values($chunk));
            $keys = array_keys($chunk);
            foreach ($keys as $i => $key) {
                $results[$key] = $translated[$i] ?? $chunk[$key];
            }
            if (count($chunks) > 1) {
                usleep($this->delayMs * 1000);
            }
        }

        return $results;
    }

    protected function requestBatch(array $texts): array
    {
        $joined = implode("\n", array_map(function ($t) {
            return str_replace(["\r", "\n"], ' ', $t);
        }, $texts));

        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ])->get($this->baseUrl, [
            'client' => 'gtx',
            'sl' => 'en',
            'tl' => 'ur',
            'dt' => 't',
            'q' => $joined,
        ]);

        if (! $response->successful()) {
            return $texts;
        }

        $body = $response->body();
        $decoded = json_decode($body, true);
        if (! is_array($decoded) || empty($decoded[0])) {
            return $texts;
        }

        $singleTranslated = '';
        foreach ($decoded[0] as $part) {
            if (isset($part[0]) && is_string($part[0])) {
                $singleTranslated .= $part[0];
            }
        }

        return array_map('trim', explode("\n", $singleTranslated));
    }

    public function setDelayMs(int $ms): self
    {
        $this->delayMs = $ms;
        return $this;
    }
}
