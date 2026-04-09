<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\Http;

class GroqChatService
{
    public function ask(string $question, array $chunks): array
    {
        $apiKey = (string) config('services.groq.api_key');
        if ($apiKey === '') {
            throw new \RuntimeException('Missing GROQ API key.');
        }

        $model = (string) config('services.groq.model', 'llama-3.3-70b-versatile');
        $url = (string) config('services.groq.base_url', 'https://api.groq.com/openai/v1');
        $timeout = (int) config('services.groq.timeout', 30);

        $contextBlock = $this->buildContext($chunks);
        $systemPrompt = $this->systemPrompt();
        $userPrompt = "User question:\n{$question}\n\nGrounding context:\n{$contextBlock}";

        $response = Http::withToken($apiKey)
            ->timeout(max($timeout, 10))
            ->post(rtrim($url, '/') . '/chat/completions', [
                'model' => $model,
                'temperature' => 0.2,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ]);

        if (!$response->successful()) {
            $body = substr((string) $response->body(), 0, 400);
            throw new \RuntimeException('Groq request failed: HTTP ' . $response->status() . ' ' . $body);
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

    protected function systemPrompt(): string
    {
        return implode("\n", [
            'You are RAHJ AI assistant for an ERP system.',
            'Answer using only the provided context where possible.',
            'If context is insufficient, clearly say what is missing and ask a precise follow-up question.',
            'Keep answers practical and concise.',
            'When possible, mention relevant source titles or table names from context.',
            'When you mention any ERP route or URL, format it as a markdown link.',
            'For internal routes, use markdown like [Open Goods Receipt Register](/inventory/goods-receipt-note).',
            'Do not output plain raw route paths when a clickable markdown link can be used.',
        ]);
    }

    protected function buildContext(array $chunks): string
    {
        if (empty($chunks)) {
            return 'No context retrieved.';
        }

        $blocks = [];
        foreach ($chunks as $index => $chunk) {
            $label = $index + 1;
            $sourcePath = (string) ($chunk['source_path'] ?? 'unknown');
            $title = (string) ($chunk['document_title'] ?? 'Untitled');
            $section = (string) ($chunk['section_title'] ?? '');
            $table = (string) ($chunk['table_name'] ?? '');
            $content = (string) ($chunk['content'] ?? '');

            $meta = "source={$sourcePath}; title={$title}";
            if ($section !== '') {
                $meta .= "; section={$section}";
            }
            if ($table !== '') {
                $meta .= "; table={$table}";
            }

            $blocks[] = "[Chunk {$label}] {$meta}\n{$content}";
        }

        return implode("\n\n", $blocks);
    }
}
