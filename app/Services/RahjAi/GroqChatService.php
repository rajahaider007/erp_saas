<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqChatService
{
    public function __construct(
        protected ?GroqModelRouter $modelRouter = null
    ) {
        $this->modelRouter = $modelRouter ?? app(GroqModelRouter::class);
    }

    /**
     * @param  array{
     *     session_brief?: string,
     *     language_hint?: string,
     *     chat_history?: list<array{role: string, content: string}>,
     *     model?: string
     * }  $options
     */
    public function ask(string $question, array $chunks, array $options = []): array
    {
        $apiKey = (string) config('services.groq.api_key');
        if ($apiKey === '') {
            throw new \RuntimeException('Missing GROQ API key.');
        }

        $model = isset($options['model']) && is_string($options['model']) && $options['model'] !== ''
            ? (string) $options['model']
            : $this->modelRouter->selectMainChatModel($question);
        $url = (string) config('services.groq.base_url', 'https://api.groq.com/openai/v1');
        $timeout = (int) config('services.groq.timeout', 30);

        $maxQuestion = max(500, (int) config('services.groq.max_question_chars', 8000));
        if (mb_strlen($question) > $maxQuestion) {
            $question = mb_substr($question, 0, $maxQuestion).'…';
        }

        $contextBlock = $this->buildContext($chunks);
        $sessionBrief = trim((string) ($options['session_brief'] ?? ''));
        $languageHint = (string) ($options['language_hint'] ?? 'en');
        $chatHistory = $options['chat_history'] ?? [];
        if (! is_array($chatHistory)) {
            $chatHistory = [];
        }

        $hasHistory = $this->historyHasTurns($chatHistory);
        $systemPrompt = $this->systemPrompt($languageHint, $sessionBrief, $hasHistory);
        $userParts = ["User question:\n{$question}"];
        if ($sessionBrief !== '') {
            $userParts[] = "Session summary:\n{$sessionBrief}";
        }
        $userParts[] = "Grounding context (documents + optional live snippets):\n{$contextBlock}";
        $userPrompt = implode("\n\n", $userParts);

        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach ($this->normalizeChatHistoryForApi($chatHistory) as $turn) {
            $messages[] = $turn;
        }
        $messages[] = ['role' => 'user', 'content' => $userPrompt];

        $temperature = str_contains((string) $model, 'deepseek-r1') ? 0.55 : 0.2;

        $response = Http::withToken($apiKey)
            ->timeout(max($timeout, 10))
            ->post(rtrim($url, '/').'/chat/completions', [
                'model' => $model,
                'temperature' => $temperature,
                'messages' => $messages,
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
            'routing' => [
                'selected_model' => $model,
                'override' => isset($options['model']) && $options['model'] !== '',
            ],
        ];
    }

    /**
     * Optional second pass: small model checks draft vs grounding (extra latency + cost).
     *
     * @return array{status: string, detail: string|null}
     */
    public function verifyGroundedDraft(string $question, array $chunks, string $draftAnswer): array
    {
        if (! (bool) config('services.groq.answer_verify_enabled', false)) {
            return ['status' => 'skipped', 'detail' => null];
        }

        $apiKey = (string) config('services.groq.api_key');
        if ($apiKey === '' || trim($draftAnswer) === '') {
            return ['status' => 'skipped', 'detail' => null];
        }

        $verifier = (string) config('services.groq.verifier_model', '');
        if ($verifier === '') {
            return ['status' => 'skipped', 'detail' => null];
        }

        $url = (string) config('services.groq.base_url', 'https://api.groq.com/openai/v1');
        $timeout = min((int) config('services.groq.timeout', 30), 20);

        $grounding = $this->buildContext($chunks);
        $maxGround = 6000;
        if (mb_strlen($grounding) > $maxGround) {
            $grounding = mb_substr($grounding, 0, $maxGround).'…';
        }

        $maxDraft = 4000;
        if (mb_strlen($draftAnswer) > $maxDraft) {
            $draftAnswer = mb_substr($draftAnswer, 0, $maxDraft).'…';
        }

        $system = implode("\n", [
            'You audit draft answers for RAHJ AI (ERP assistant).',
            'Compare the draft to the grounding text only. Do not invent facts.',
            'If the draft invents routes, balances, permissions, or procedures not supported by grounding, respond warn.',
            'Output ONLY compact JSON: {"status":"ok|warn","detail":"short reason or empty string"}.',
        ]);

        try {
            $response = Http::withToken($apiKey)
                ->timeout(max($timeout, 5))
                ->post(rtrim($url, '/').'/chat/completions', [
                    'model' => $verifier,
                    'temperature' => 0,
                    'max_tokens' => 120,
                    'messages' => [
                        ['role' => 'system', 'content' => $system],
                        ['role' => 'user', 'content' => "User question:\n{$question}\n\nGrounding:\n{$grounding}\n\nDraft answer:\n{$draftAnswer}"],
                    ],
                ]);

            if (! $response->successful()) {
                Log::warning('RAHJ verifier HTTP failure', ['status' => $response->status()]);

                return ['status' => 'error', 'detail' => null];
            }

            $raw = trim((string) data_get($response->json(), 'choices.0.message.content', ''));
            $parsed = $this->parseScopeGateJson($raw);
            if (! is_array($parsed)) {
                return ['status' => 'unparseable', 'detail' => null];
            }

            $status = (string) ($parsed['status'] ?? 'ok');
            $detail = isset($parsed['detail']) ? trim((string) $parsed['detail']) : null;
            if ($detail === '') {
                $detail = null;
            }

            return ['status' => $status, 'detail' => $detail];
        } catch (\Throwable $e) {
            Log::warning('RAHJ verifier exception', ['message' => $e->getMessage()]);

            return ['status' => 'error', 'detail' => null];
        }
    }

    /**
     * @param  list<array{role: string, content: string}>  $chatHistory
     */
    protected function historyHasTurns(array $chatHistory): bool
    {
        foreach ($chatHistory as $row) {
            if (! is_array($row)) {
                continue;
            }
            $role = (string) ($row['role'] ?? '');
            $content = trim((string) ($row['content'] ?? ''));
            if ($content !== '' && in_array($role, ['user', 'assistant'], true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  list<array{role?: string, content?: string}>  $chatHistory
     * @return list<array{role: string, content: string}>
     */
    protected function normalizeChatHistoryForApi(array $chatHistory): array
    {
        $perMsgCap = max(200, (int) config('services.groq.chat_history_max_chars_per_message', 3500));
        $totalCap = max($perMsgCap, (int) config('services.groq.chat_history_max_total_chars', 16000));

        $rows = [];
        foreach ($chatHistory as $row) {
            if (! is_array($row)) {
                continue;
            }
            $role = (string) ($row['role'] ?? '');
            if (! in_array($role, ['user', 'assistant'], true)) {
                continue;
            }
            $content = trim((string) ($row['content'] ?? ''));
            if ($content === '') {
                continue;
            }
            if (mb_strlen($content) > $perMsgCap) {
                $content = mb_substr($content, 0, $perMsgCap).'…';
            }
            $rows[] = ['role' => $role, 'content' => $content];
        }

        // Prefer the newest turns when the body would exceed Groq size limits.
        $used = 0;
        $packed = [];
        for ($i = count($rows) - 1; $i >= 0; $i--) {
            $len = mb_strlen($rows[$i]['content']);
            if ($used + $len > $totalCap) {
                continue;
            }
            $used += $len;
            array_unshift($packed, $rows[$i]);
        }

        return $packed;
    }

    protected function systemPrompt(string $languageHint, string $sessionBrief, bool $includeThreadHint = false): string
    {
        $lines = [
            'You are RAHJ AI, the in-app assistant for this company\'s ERP (accounting, inventory, procurement, and related workflows).',
            'If the user asks about personal relationships, medical diagnosis/treatment, illegal activity unrelated to business software, or sexual/vulgar/harassing content, politely refuse: you are only for ERP / business software help. Do not blend ERP tips into such answers.',
            'Tone: professional, clear, and helpful. Prefer short paragraphs and bullet steps when explaining procedures.',
            'Accuracy: ground answers in the "Grounding context" and "Session summary". If information is missing or uncertain, say so and ask one focused follow-up question.',
            'ERP data entry (create / update / delete): never invent defaults for financial classification. Example: new **bank** or **cash-at-bank** ledgers belong under **Asset** (and an appropriate Level 3 parent from the chart), not Equity, unless grounding explicitly shows otherwise.',
            'When you still need values from the user, ask in a structured way: short intro, then a compact markdown table or bullet list with columns/labels **Field**, **Example**, **Notes**—not a wall of raw variable names. Prefer one screen of questions at a time.',
            'Unknown / weak context: if grounding is empty, says "No context retrieved", or does not clearly contain the answer, do NOT guess routes, screen names, voucher numbers, or balances. Briefly say the docs/snippets do not cover it, then ask exactly ONE specific follow-up (e.g. which module, document type, or date range).',
            'Do not treat generic route lists alone as proof of a workflow; prefer explicit procedure chunks when present.',
            'Do not invent transactions, balances, or permissions. Never claim full database access; you only see what is provided in context.',
            'Security: do not expose secrets, tokens, or other users\' data. Assume the user is authenticated; still avoid sensitive internal IDs unless useful.',
            'Navigation: use markdown links with paths exactly as in grounding context. Purchase order list (pending/open/draft) lives at `/inventory/purchase-order` (singular segment `purchase-order`, never `purchase-orders`). Example: [Purchase orders](/inventory/purchase-order).',
            'If the user mixes Urdu (Roman or script) with English, reply in the same style when natural (language_hint may hint at this).',
        ];

        if ($includeThreadHint) {
            $lines[] = 'Prior user/assistant turns in this request are the live chat thread for this session. Use them to interpret follow-ups (e.g. "wohi", "that one", "the code you just made", delete/edit) without asking the user to repeat details already stated above.';
        }

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
