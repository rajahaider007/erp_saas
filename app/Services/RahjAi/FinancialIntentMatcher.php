<?php

namespace App\Services\RahjAi;

/**
 * Maps natural language to accounts-dashboard financial report types using config only.
 */
class FinancialIntentMatcher
{
    public function match(string $normalized): ?array
    {
        foreach (config('rahj_ai_financial_intents.intents', []) as $def) {
            if (! is_array($def) || empty($def['must_contain_all'])) {
                continue;
            }
            if ($this->matches($normalized, $def)) {
                return $def;
            }
        }

        return null;
    }

    public function definitionForIntent(string $intent): ?array
    {
        foreach (config('rahj_ai_financial_intents.intents', []) as $def) {
            if (($def['intent'] ?? '') === $intent) {
                return $def;
            }
        }

        return null;
    }

    public function isFinancialIntent(string $intent): bool
    {
        return $this->definitionForIntent($intent) !== null;
    }

    protected function matches(string $normalized, array $def): bool
    {
        foreach ($def['must_contain_all'] as $group) {
            if (! is_array($group) || ! $this->groupMatches($normalized, $group)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  list<string>  $keywords
     */
    protected function groupMatches(string $normalized, array $keywords): bool
    {
        foreach ($keywords as $kw) {
            if (! is_string($kw) || $kw === '') {
                continue;
            }
            if (str_contains($normalized, mb_strtolower($kw))) {
                return true;
            }
        }

        return false;
    }
}
