<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\Log;

/**
 * Smart Entry Service — Interactive field collection + auto-mapping + submission
 * 
 * Enables RAHJ AI to:
 * 1. Detect which form/entry type user wants to create
 * 2. Extract values from natural language
 * 3. Ask for missing required fields
 * 4. Auto-submit or provide prefilled draft
 */
class SmartEntryService
{
    /**
     * Detect if user is asking to create a COA Level 4 code
     */
    public function isCoaCodeCreationIntent(string $normalized): bool
    {
        return (
            (str_contains($normalized, 'level 4') || str_contains($normalized, 'level4')) &&
            (str_contains($normalized, 'code') || str_contains($normalized, 'account')) &&
            (str_contains($normalized, 'create') || str_contains($normalized, 'new') || str_contains($normalized, 'add') || str_contains($normalized, 'bana'))
        ) || (
            str_contains($normalized, 'chart of account') &&
            str_contains($normalized, 'code') &&
            (str_contains($normalized, 'create') || str_contains($normalized, 'new'))
        );
    }

    /**
     * Extract COA code creation parameters from user input
     */
    public function extractCoaCodeParams(string $input): array
    {
        $extracted = [
            'account_code' => null,
            'account_name' => null,
            'account_type' => null,
            'is_transactional' => true,
            'parent_account_id' => null,
            'parent_code' => null, // Used for lookup
        ];

        // Try to extract account code — look for explicit patterns like "TEST code" or bare codes after keywords
        if (preg_match('/\b([A-Z]{3,10})\s+(?:code|kode|کوڈ)(?:\s+(?:by|by\s+name|named?|ka naam|ke naam|by|---))?\b/i', $input, $m)) {
            $extracted['account_code'] = strtoupper($m[1]);
            // Extract name if pattern is "CODE by NAME" or "CODE code by NAME"
            if (preg_match('/\b' . preg_quote(strtoupper($m[1])) . '\s+(?:code|kode)?\s+(?:by|---)\s+([A-Za-z\s&]+?)(?:\s*$|under|\s+level|k name|ke naam)/i', $input, $nameMatch)) {
                $extracted['account_name'] = trim($nameMatch[1]);
            }
        } elseif (preg_match('/code:\s*([A-Z0-9]+)/i', $input, $m)) {
            // Fallback: explicit "code: VALUE" pattern
            $extracted['account_code'] = strtoupper($m[1]);
        }

        // If we have code but no name yet, try secondary name extraction
        if ($extracted['account_code'] && !$extracted['account_name']) {
            if (preg_match('/(?:by|named?|ka naam|ke naam|ke naam)\s+([A-Za-z\s&]+?)(?:\s*$|\.|,|under)/i', $input, $m)) {
                $extracted['account_name'] = trim($m[1]);
            }
        }

        // Try to extract parent/level3 code (usually longer alphanumeric)
        if (preg_match('/\b([0-9]{10,})\b/i', $input, $m)) {
            $extracted['parent_code'] = $m[1];
        } elseif (preg_match('/(?:level\s+3|level3)\s+(?:code|account)?\s*:?\s*([A-Z0-9]{4,})/i', $input, $m)) {
            $extracted['parent_code'] = strtoupper($m[1]);
        } elseif (preg_match('/under\s+([A-Z0-9]{4,})/i', $input, $m)) {
            $extracted['parent_code'] = strtoupper($m[1]);
        }

        // Try to extract account type
        $typeMap = [
            'asset' => 'Asset',
            'liability' => 'Liability',
            'equity' => 'Equity',
            'revenue' => 'Revenue',
            'expense' => 'Expense',
            'contra' => 'Contra-Asset',
        ];

        foreach (array_keys($typeMap) as $type) {
            if (str_contains(mb_strtolower($input), $type)) {
                $extracted['account_type'] = $typeMap[$type];
                break;
            }
        }

        // Check if transactional
        if (str_contains(mb_strtolower($input), 'non-transactional') || str_contains(mb_strtolower($input), 'nontransactional')) {
            $extracted['is_transactional'] = false;
        }

        return $extracted;
    }

    /**
     * Build a smart entry response with field collection questions
     */
    public function buildCoaCodeSmartResponse(
        string $question,
        array $extracted,
        ?int $level3AccountId,
        string $languageHint
    ): array {
        $missing = [];
        $confirmation = [];

        // Check required fields
        if (!$extracted['account_code']) {
            $missing['account_code'] = 'Account Code (e.g., TEST, RAHG, ACC001)';
        } else {
            $confirmation[] = "Code: **{$extracted['account_code']}**";
        }

        if (!$extracted['account_name']) {
            $missing['account_name'] = 'Account Name (e.g., RAHG Account, Test Account)';
        } else {
            $confirmation[] = "Name: **{$extracted['account_name']}**";
        }

        if (!$level3AccountId && !$extracted['parent_code']) {
            $missing['parent_code'] = 'Parent Level 3 Account Code (e.g., 300010001000000)';
        } elseif ($extracted['parent_code']) {
            $confirmation[] = "Under Level 3 Code: **{$extracted['parent_code']}**";
        }

        if (!$extracted['account_type']) {
            $extracted['account_type'] = 'Equity'; // Default based on common usage
            $confirmation[] = "Type: **{$extracted['account_type']}** (default)";
        } else {
            $confirmation[] = "Type: **{$extracted['account_type']}**";
        }

        $confirmation[] = "Transactional: **" . ($extracted['is_transactional'] ? 'Yes' : 'No') . "**";

        // If any fields missing, ask user for them
        if (!empty($missing)) {
            $missingList = implode("\n", array_map(
                fn($k, $v) => "- **$k**: $v",
                array_keys($missing),
                array_values($missing)
            ));

            $answer = "I can create a Level 4 COA code for you. Please provide the missing details:\n\n$missingList";

            if (!empty($confirmation)) {
                $answer .= "\n\nI've extracted:\n" . implode("\n", $confirmation);
            }

            return [
                'mode' => 'smart_entry_field_collection',
                'answer' => $answer,
                'extracted' => $extracted,
                'missing_fields' => array_keys($missing),
                'can_auto_submit' => false,
            ];
        }

        // All fields available — ready to create
        $confirmationText = implode("\n", $confirmation);

        $answer = "I'm ready to create this Level 4 COA code:\n\n$confirmationText\n\n";
        $answer .= "**Confirm & Create** — I'll create this code immediately. Review above and confirm (say 'yes', 'create', or 'confirm').";

        return [
            'mode' => 'smart_entry_ready_confirmation',
            'answer' => $answer,
            'extracted' => $extracted,
            'action' => [
                'type' => 'create_coa_code',
                'target' => 'chart_of_account_code',
                'route' => '/api/accounts/coa-codes',
                'method' => 'POST',
                'payload' => [
                    'parent_code' => $extracted['parent_code'],
                    'account_code' => $extracted['account_code'],
                    'account_name' => $extracted['account_name'],
                    'account_type' => $extracted['account_type'],
                    'is_transactional' => $extracted['is_transactional'],
                ],
                'requires_confirmation' => true,
                'auto_submit_on_confirm' => true,
            ],
            'can_auto_submit' => true,
        ];
    }

    /**
     * Try to resolve smart entry from user's follow-up response
     */
    public function tryResolveSmartEntryFieldCollection(
        string $response,
        array $pendingData
    ): ?array {
        $normalized = mb_strtolower(trim($response));
        $extracted = $pendingData['extracted'] ?? [];
        $missingFields = $pendingData['missing_fields'] ?? [];

        // User is providing more info — try to parse
        foreach ($missingFields as $field) {
            if ($field === 'account_code') {
                if (preg_match('/\b([A-Z0-9]{2,10})\b/i', $response, $m)) {
                    $extracted['account_code'] = strtoupper($m[1]);
                }
            } elseif ($field === 'account_name') {
                // Try to extract a name (usually longer text)
                if (preg_match('/(?:name|named?|ka naam|---)\s+([A-Za-z\s&]+?)(?:\s*$|under|code)/i', $response, $m)) {
                    $extracted['account_name'] = trim($m[1]);
                } else {
                    // Just take non-standard words as account name
                    $words = preg_split('/\s+/', $response);
                    if (count($words) >= 2) {
                        $extracted['account_name'] = implode(' ', array_slice($words, 0, 3));
                    }
                }
            } elseif ($field === 'parent_code') {
                if (preg_match('/\b([A-Z0-9]{10,})\b/i', $response, $m)) {
                    $extracted['parent_code'] = strtoupper($m[1]);
                } elseif (preg_match('/\b([A-Z0-9]{4,10})\b/', $response, $m)) {
                    $extracted['parent_code'] = strtoupper($m[1]);
                }
            }
        }

        $updatedMissing = [];
        if (!$extracted['account_code']) {
            $updatedMissing[] = 'account_code';
        }
        if (!$extracted['account_name']) {
            $updatedMissing[] = 'account_name';
        }
        if (!$extracted['parent_code']) {
            $updatedMissing[] = 'parent_code';
        }

        if (empty($updatedMissing)) {
            // All fields resolved
            return [
                'complete' => true,
                'extracted' => $extracted,
            ];
        }

        return null;
    }

    /**
     * Check if user confirmed smart entry submission
     */
    public function isSmartEntryConfirmation(string $normalized): bool
    {
        return (
            str_contains($normalized, 'yes') ||
            str_contains($normalized, 'create') ||
            str_contains($normalized, 'confirm') ||
            str_contains($normalized, 'ok') ||
            str_contains($normalized, 'haan') ||
            str_contains($normalized, 'bilkul') ||
            str_contains($normalized, 'thik')
        );
    }
}
