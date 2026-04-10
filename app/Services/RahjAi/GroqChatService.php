<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqChatService
{
    /**
     * @param  array{session_brief?: string, language_hint?: string}  $options
     */
    public function ask(string $question, array $chunks, array $options = []): array
    {
        $apiKey = (string) config('services.groq.api_key');
        if ($apiKey === '') {
            throw new \RuntimeException('Missing GROQ API key.');
        }

        $model = (string) config('services.groq.model', 'llama-3.3-70b-versatile');
        $url = (string) config('services.groq.base_url', 'https://api.groq.com/openai/v1');
        $timeout = (int) config('services.groq.timeout', 30);

        $maxQuestion = max(500, (int) config('services.groq.max_question_chars', 8000));
        if (mb_strlen($question) > $maxQuestion) {
            $question = mb_substr($question, 0, $maxQuestion).'…';
        }

        $contextBlock = $this->buildContext($chunks);
        $sessionBrief = trim((string) ($options['session_brief'] ?? ''));
        $languageHint = (string) ($options['language_hint'] ?? 'en');

        $systemPrompt = $this->systemPrompt($languageHint, $sessionBrief);
        $userParts = ["User question:\n{$question}"];
        if ($sessionBrief !== '') {
            $userParts[] = "Session summary:\n{$sessionBrief}";
        }
        $userParts[] = "Grounding context (documents + optional live snippets):\n{$contextBlock}";
        $userPrompt = implode("\n\n", $userParts);

        $response = Http::withToken($apiKey)
            ->timeout(max($timeout, 10))
            ->post(rtrim($url, '/').'/chat/completions', [
                'model' => $model,
                'temperature' => 0.2,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);

        if (! $response->successful()) {
            $body = substr((string) $response->body(), 0, 400);
            throw new \RuntimeException('Groq request failed: HTTP '.$response->status().' '.$body);
        }

        $data = $response->json();
        $answer = (string) data_get($data, 'choices.0.message.content', '');
        if ($answer === '') {
            throw new \RuntimeException('Groq returned an empty response.');
        }

        return [
            'answer' => trim($answer),
            'model' => $model,
        ];
    }

    protected function systemPrompt(string $languageHint, string $sessionBrief): string
    {
        $lines = [
            'You are RAHJ AI, the in-app assistant for this company\'s ERP (accounting, inventory, procurement, and related workflows).',
            'If the user asks about personal relationships, medical diagnosis/treatment, illegal activity unrelated to business software, or sexual/vulgar/harassing content, politely refuse: you are only for ERP / business software help. Do not blend ERP tips into such answers.',
            'Tone: professional, clear, and helpful. Prefer short paragraphs and bullet steps when explaining procedures.',
            'Accuracy: ground answers in the "Grounding context" and "Session summary". If information is missing or uncertain, say so and ask one focused follow-up question.',
            'Do not invent transactions, balances, or permissions. Never claim full database access; you only see what is provided in context.',
            'Security: do not expose secrets, tokens, or other users\' data. Assume the user is authenticated; still avoid sensitive internal IDs unless useful.',
            'Navigation: use markdown links with paths exactly as in grounding context. Purchase order list (pending/open/draft) lives at `/inventory/purchase-order` (singular segment `purchase-order`, never `purchase-orders`). Example: [Purchase orders](/inventory/purchase-order).',
            'If the user mixes Urdu (Roman or script) with English, reply in the same style when natural (language_hint may hint at this).',
        ];

        if ($languageHint === 'ur_mix') {
            $lines[] = 'The user may use Urdu/Roman Urdu; you may respond with clear English or gentle Urdu-English mix for friendliness, staying professional.';
        }

        if ($sessionBrief !== '') {
            $lines[] = 'Use the session summary to personalize routes and examples (company, location, modules the user can access).';
        }

        return implode("\n", $lines);
    }

    protected function buildContext(array $chunks): string
    {
        if (empty($chunks)) {
            return 'No context retrieved.';
        }

        $maxChunk = max(400, (int) config('services.groq.max_context_chunk_chars', 6000));
        $maxTotal = max($maxChunk * 2, (int) config('services.groq.max_context_total_chars', 72000));

        $blocks = [];
        $totalLen = 0;
        $suffix = "\n[...truncated for API size limit; ask a narrower question if detail is missing.]";

        foreach ($chunks as $index => $chunk) {
            $label = $index + 1;
            $sourcePath = (string) ($chunk['source_path'] ?? 'unknown');
            $title = (string) ($chunk['document_title'] ?? 'Untitled');
            $section = (string) ($chunk['section_title'] ?? '');
            $table = (string) ($chunk['table_name'] ?? '');
            $rawContent = (string) ($chunk['content'] ?? '');

            $meta = "source={$sourcePath}; title={$title}";
            if ($section !== '') {
                $meta .= "; section={$section}";
            }
            if ($table !== '') {
                $meta .= "; table={$table}";
            }

            $content = $rawContent;
            if (mb_strlen($content) > $maxChunk) {
                $content = mb_substr($content, 0, $maxChunk).$suffix;
            }

            $header = "[Chunk {$label}] {$meta}\n";
            $block = $header.$content;
            $blockLen = mb_strlen($block);

            if ($totalLen + $blockLen > $maxTotal) {
                $room = $maxTotal - $totalLen - mb_strlen($header) - mb_strlen($suffix);
                if ($room > 400) {
                    $content = mb_substr($content, 0, $room).$suffix;
                    $blocks[] = $header.$content;
                } else {
                    $blocks[] = '[Note] Additional grounding chunks omitted (Groq request size limit).';
                }
                break;
            }

            $blocks[] = $block;
            $totalLen += $blockLen;
        }

        return implode("\n\n", $blocks);
    }

    /**
     * Ask the model whether the user message is in scope for this ERP assistant.
     * Uses judgment (not keyword lists). On errors or missing API key, returns in_scope true so chat still works.
     *
     * @return array{in_scope: bool, category: string|null}
     */
    public function evaluateErpMessageScope(string $question, string $languageHint = 'en'): array
    {
        if (! (bool) config('services.groq.scope_gate_enabled', true)) {
            return ['in_scope' => true, 'category' => null];
        }

        $apiKey = (string) config('services.groq.api_key');
        if ($apiKey === '') {
            return ['in_scope' => true, 'category' => null];
        }

        $model = (string) (config('services.groq.scope_model') ?: config('services.groq.model', 'llama-3.3-70b-versatile'));
        $url = (string) config('services.groq.base_url', 'https://api.groq.com/openai/v1');
        $timeout = min((int) config('services.groq.timeout', 30), 15);

        $maxQuestion = max(200, (int) config('services.groq.max_question_chars', 8000));
        if (mb_strlen($question) > $maxQuestion) {
            $question = mb_substr($question, 0, $maxQuestion).'…';
        }

        $langNote = $languageHint === 'ur_mix'
            ? 'The message may be Urdu script, Roman Urdu, English, or mixed.'
            : 'The message may be English, Roman Urdu, or other languages.';

        $system = implode("\n", [
            'You classify user messages for RAHJ AI, an in-app ERP assistant (accounting, inventory, procurement, company workflows, permissions, navigation in this software).',
            $langNote,
            'Decide using meaning and intent—not keyword matching.',
            'IN_SCOPE: anything about using this ERP, business operations supported by it, data/reports in the app, navigation, permissions, greetings/thanks/clarifications about those topics.',
            'OUT_OF_SCOPE: personal relationships/dating/romance advice, mental health therapy, medical symptoms/diagnosis/treatment, sexual or vulgar content, harassment, illegal instructions unrelated to ERP, unrelated trivia/homework/politics/religion as the main request.',
            'Output ONLY compact JSON with keys: in_scope (boolean), category (string).',
            'When in_scope is true set category to "erp". When false set category to one of: personal, medical, vulgar, illegal, other_off_topic.',
        ]);

        try {
            $response = Http::withToken($apiKey)
                ->timeout(max($timeout, 5))
                ->post(rtrim($url, '/').'/chat/completions', [
                    'model' => $model,
                    'temperature' => 0,
                    'max_tokens' => 96,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => "User message to classify:\n{$question}"],
                    ],
                ]);

            if (! $response->successful()) {
                Log::warning('RAHJ scope gate HTTP failure', ['status' => $response->status()]);

                return ['in_scope' => true, 'category' => null];
            }

            $raw = trim((string) data_get($response->json(), 'choices.0.message.content', ''));
            $parsed = $this->parseScopeGateJson($raw);
            if ($parsed === null) {
                Log::warning('RAHJ scope gate unparseable response', ['raw' => mb_substr($raw, 0, 200)]);

                return ['in_scope' => true, 'category' => null];
            }

            $inScope = (bool) ($parsed['in_scope'] ?? true);
            $category = isset($parsed['category']) ? (string) $parsed['category'] : null;
            if ($inScope) {
                $category = 'erp';
            }

            return ['in_scope' => $inScope, 'category' => $category];
        } catch (\Throwable $e) {
            Log::warning('RAHJ scope gate exception', ['message' => $e->getMessage()]);

            return ['in_scope' => true, 'category' => null];
        }
    }

    /**
     * @return array{in_scope?: bool, category?: string}|null
     */
    protected function parseScopeGateJson(string $raw): ?array
    {
        $trimmed = trim($raw);
        if ($trimmed === '') {
            return null;
        }

        if (preg_match('/\{[\s\S]*\}/', $trimmed, $m)) {
            $trimmed = $m[0];
        }

        $decoded = json_decode($trimmed, true);
        if (! is_array($decoded)) {
            return null;
        }

        return $decoded;
    }
}
