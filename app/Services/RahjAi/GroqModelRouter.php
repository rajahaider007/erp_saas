<?php

namespace App\Services\RahjAi;

class GroqModelRouter
{
    /**
     * Pick a Groq chat model for the main RAG reply. One model per request (no parallel fan-out).
     */
    public function selectMainChatModel(string $question): string
    {
        $mode = (string) config('services.groq.routing_mode', 'auto');
        $default = (string) config('services.groq.model', 'llama-3.3-70b-versatile');
        $reasoning = (string) config('services.groq.reasoning_model', 'deepseek-r1-distill-llama-70b');
        $economy = (string) config('services.groq.economy_model', 'mixtral-8x7b-32768');

        if ($mode === 'default' || $mode === 'single') {
            return $default;
        }
        if ($mode === 'reasoning') {
            return $reasoning !== '' ? $reasoning : $default;
        }
        if ($mode === 'economy') {
            return $economy !== '' ? $economy : $default;
        }

        $normalized = mb_strtolower($question);

        if ($this->looksLikeEconomyTurn($normalized, $question)) {
            return $economy !== '' ? $economy : $default;
        }

        if ($this->looksLikeReasoningTurn($normalized)) {
            return $reasoning !== '' ? $reasoning : $default;
        }

        return $default;
    }

    protected function looksLikeEconomyTurn(string $normalized, string $raw): bool
    {
        if (mb_strlen(trim($raw)) > 220) {
            return false;
        }

        if (preg_match('/^(hi|hello|hey|salam|assalam|thanks|thank you|shukriya|ok|okay|theek|thik|got it)\b[\s!.?]*$/iu', trim($raw)) === 1) {
            return true;
        }

        if (
            preg_match('/\b(one\s*line|tl;?dr|tldr|short\s+summary|briefly|in\s+a\s+sentence)\b/u', $normalized) === 1
            && mb_strlen(trim($raw)) < 180
        ) {
            return true;
        }

        return false;
    }

    protected function looksLikeReasoningTurn(string $normalized): bool
    {
        if (preg_match('/\b(calculate|calculation|reconcile|reconciliation|variance|percentage|%\b|formula|sql\b|query\b|debug|stack\s*trace|exception|error\s+code|logic|prove|why\s+does|how\s+does\s+.*\bwork|compare\b.*\band\b|difference\s+between)\b/u', $normalized) === 1) {
            return true;
        }

        if (preg_match('/[\d]+\s*[\+\-\*\/\^]\s*[\d]+/', $normalized) === 1) {
            return true;
        }

        if (str_contains($normalized, '```')) {
            return true;
        }

        return false;
    }
}
