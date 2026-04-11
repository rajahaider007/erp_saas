<?php

namespace App\Services\RahjAi;

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
    public const COA_FORM_ID = 'smart_entry_coa_level4';

    /**
     * Detect if user is asking to create a COA Level 4 code
     */
    public function isCoaCodeCreationIntent(string $normalized): bool
    {
        $level4 = str_contains($normalized, 'level 4') || str_contains($normalized, 'level4');
        $coa = str_contains($normalized, 'chart of account')
            || str_contains($normalized, 'chart of accounts')
            || preg_match('/\bcoa\b/', $normalized) === 1;

        $action = str_contains($normalized, 'create')
            || str_contains($normalized, 'new')
            || str_contains($normalized, 'add')
            || str_contains($normalized, 'bana')
            || str_contains($normalized, 'banana')
            || str_contains($normalized, 'banao')
            || str_contains($normalized, 'krna')
            || str_contains($normalized, 'karna')
            || str_contains($normalized, 'bna');

        $codeOrAccount = str_contains($normalized, 'code')
            || str_contains($normalized, 'account')
            || str_contains($normalized, 'bank');

        if ($level4 && $codeOrAccount && $action) {
            return true;
        }

        if ($coa && str_contains($normalized, 'bank') && $action) {
            return true;
        }

        return $coa && str_contains($normalized, 'code') && $action;
    }

    /**
     * Extract COA code creation parameters from user input
     */
    public function extractCoaCodeParams(string $input): array
    {
        $lower = mb_strtolower($input);
        $bankCashContext = str_contains($lower, 'bank')
            || str_contains($lower, 'banks')
            || str_contains($lower, 'cash at bank')
            || str_contains($lower, 'current account')
            || str_contains($lower, 'alfalah')
            || str_contains($lower, 'hbl')
            || str_contains($lower, 'ubl')
            || str_contains($lower, 'mcb');

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

        if ($extracted['account_type'] === null && $bankCashContext) {
            $extracted['account_type'] = 'Asset';
        }

        if ($extracted['account_name'] === null && $bankCashContext) {
            if (preg_match('/(?:name|naam)\s+(?:hain|hai|hy|he)\s+([A-Za-z0-9\s&\-\.]+?)(?:\.|$|under|level|chart)/ui', $input, $m)) {
                $extracted['account_name'] = trim($m[1]);
            } elseif (preg_match('/\b(alfalah|hbl|ubl|mcb|meezan|askari)\w*\b/ui', $input, $m)) {
                $extracted['account_name'] = 'Bank '.ucfirst(strtolower(trim($m[1])));
            }
        }

        // Check if transactional
        if (str_contains(mb_strtolower($input), 'non-transactional') || str_contains(mb_strtolower($input), 'nontransactional')) {
            $extracted['is_transactional'] = false;
        }

        return $extracted;
    }

    /**
     * Parse a structured reply produced by the in-chat COA form (see RahjAiChatView).
     *
     * @return array<string, mixed>|null
     */
    public function parseCoaFormReply(string $response): ?array
    {
        $trim = trim($response);
        if ($trim === '' || ! str_contains($trim, '[Form:')) {
            return null;
        }

        if (! preg_match('/\[Form:\s*'.preg_quote(self::COA_FORM_ID, '/').'\]\s*/i', $trim)) {
            return null;
        }

        $body = preg_replace('/^\[Form:\s*'.preg_quote(self::COA_FORM_ID, '/').'\]\s*/i', '', $trim);
        $lines = preg_split("/\r\n|\n|\r/", (string) $body);
        $out = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            if (! str_contains($line, ':')) {
                continue;
            }
            [$key, $value] = explode(':', $line, 2);
            $key = strtolower(trim($key));
            $value = trim($value);
            if ($key === '' || $value === '') {
                continue;
            }
            if ($key === 'is_transactional') {
                $lv = mb_strtolower($value);
                $out[$key] = ! in_array($lv, ['0', 'false', 'no', 'n', 'off', 'nahi', 'na'], true);

                continue;
            }
            $out[$key] = $key === 'account_code' || $key === 'parent_code'
                ? strtoupper($value)
                : $value;
        }

        return $out === [] ? null : $out;
    }

    /**
     * Build a smart entry response with field collection questions
     */
    public function buildCoaCodeSmartResponse(
        string $question,
        array $extracted,
        ?int $level3AccountId,
        string $languageHint,
        array $level3Suggestions = []
    ): array {
        $missing = [];
        $confirmation = [];

        // Check required fields
        if (! $extracted['account_code']) {
            $missing['account_code'] = 'Short code for this ledger (letters/numbers, unique for your company).';
        } else {
            $confirmation[] = "Code: **{$extracted['account_code']}**";
        }

        if (! $extracted['account_name']) {
            $missing['account_name'] = 'Display name as it should appear in the chart (e.g. Bank Alfalah – Main).';
        } else {
            $confirmation[] = "Name: **{$extracted['account_name']}**";
        }

        if (! $level3AccountId && ! $extracted['parent_code']) {
            $missing['parent_code'] = 'Existing Level 3 parent account code from your chart (bank accounts usually sit under an Asset / cash-at-bank branch).';
        } elseif ($extracted['parent_code']) {
            $confirmation[] = "Under Level 3 Code: **{$extracted['parent_code']}**";
        }

        if (empty($extracted['account_type'])) {
            $missing['account_type'] = 'Pick the category that matches this ledger (bank / cash at bank → Asset).';
        } else {
            $confirmation[] = "Type: **{$extracted['account_type']}**";
        }

        $confirmation[] = 'Transactional: **'.($extracted['is_transactional'] ? 'Yes' : 'No').'**';

        // If any fields missing, ask user for them
        if (! empty($missing)) {
            $intro = $languageHint === 'ur_mix'
                ? "Main aap ke liye **Level 4 chart code** add karne ke liye tayar hoon. Neeche form mein zaroori fields bhar dein; jo cheezain pehle se samajh aa gayi thin woh pre-fill hain."
                : 'I can add a **Level 4 chart of accounts code** under your chosen Level 3 parent. Use the form below for anything still missing; values we already understood from your message are pre-filled.';

            $answer = $intro;

            if (! empty($confirmation)) {
                $answer .= "\n\n**So far:**\n".implode("\n", $confirmation);
            }

            return [
                'mode' => 'smart_entry_field_collection',
                'answer' => $answer,
                'extracted' => $extracted,
                'missing_fields' => array_keys($missing),
                'can_auto_submit' => false,
                'input_form' => $this->buildCoaLevel4InputForm($extracted, array_keys($missing), $level3Suggestions, $languageHint),
            ];
        }

        // All fields available — ready to create
        $confirmationText = implode("\n", $confirmation);

        $answer = $languageHint === 'ur_mix'
            ? "Sab details mil gayi hain. Neeche summary dekh lain; save karne ke liye **Send** par **Confirm / Yes** likh dein ya form ke baad likh dein.\n\n{$confirmationText}"
            : "Here is the summary of the new Level 4 code. If it looks correct, reply **yes**, **confirm**, or **create** to save it.\n\n{$confirmationText}";

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
     * @param  list<array{code: string, name: string, account_type: ?string}>  $level3Suggestions
     * @return array<string, mixed>
     */
    protected function buildCoaLevel4InputForm(
        array $extracted,
        array $missingFieldKeys,
        array $level3Suggestions,
        string $languageHint
    ): array {
        $accountTypeOptions = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Contra-Asset'];
        $fields = [];

        $fields[] = [
            'name' => 'account_code',
            'label' => $languageHint === 'ur_mix' ? 'Account code' : 'Account code',
            'input' => 'text',
            'required' => true,
            'placeholder' => 'e.g. BANK_AFL',
            'value' => (string) ($extracted['account_code'] ?? ''),
            'help' => $languageHint === 'ur_mix'
                ? '3–20 uppercase letters/numbers; company/location mein unique hona chahiye.'
                : '3–20 uppercase letters or digits; must be unique for your company and location.',
        ];

        $fields[] = [
            'name' => 'account_name',
            'label' => 'Account name',
            'input' => 'text',
            'required' => true,
            'placeholder' => 'e.g. Bank Alfalah – Operations',
            'value' => (string) ($extracted['account_name'] ?? ''),
            'help' => $languageHint === 'ur_mix'
                ? 'Woh naam jo reports aur forms par dikhe ga.'
                : 'Name as it should appear on reports and data entry screens.',
        ];

        $parentHelp = $languageHint === 'ur_mix'
            ? 'Aap ke chart mein mojood Level 3 code (lamba numeric ya system code). Bank ke liye aksar Asset / cash-at-bank group.'
            : 'Use an existing Level 3 code from your chart. Bank ledgers are usually under an Asset / cash-at-bank branch.';

        $fields[] = [
            'name' => 'parent_code',
            'label' => 'Level 3 parent code',
            'input' => 'text',
            'required' => true,
            'placeholder' => 'e.g. 100010002000000',
            'value' => (string) ($extracted['parent_code'] ?? ''),
            'help' => $parentHelp,
            'suggestions' => $level3Suggestions,
        ];

        $fields[] = [
            'name' => 'account_type',
            'label' => 'Account type',
            'input' => 'select',
            'required' => true,
            'value' => (string) ($extracted['account_type'] ?? ''),
            'options' => array_map(static fn (string $t) => ['value' => $t, 'label' => $t], $accountTypeOptions),
            'help' => $languageHint === 'ur_mix'
                ? 'Bank / cash ledgers ke liye zyada tar **Asset** select karein.'
                : 'For bank and cash ledgers, choose **Asset** unless your chart structure says otherwise.',
        ];

        $fields[] = [
            'name' => 'is_transactional',
            'label' => 'Transactional',
            'input' => 'checkbox',
            'required' => false,
            'value' => (bool) ($extracted['is_transactional'] ?? true),
            'help' => $languageHint === 'ur_mix'
                ? 'Agar is code par vouchers post hon ge to on rakhein.'
                : 'Turn on if you will post vouchers against this code.',
        ];

        return [
            'type' => 'input_form',
            'form_id' => self::COA_FORM_ID,
            'title' => $languageHint === 'ur_mix' ? 'Naya Level 4 COA code' : 'New Level 4 chart code',
            'description' => $languageHint === 'ur_mix'
                ? 'Fields bhar kar **Send to assistant** dabayein.'
                : 'Complete the fields and press **Send to assistant**.',
            'fields' => $fields,
            'missing_field_keys' => $missingFieldKeys,
            'submit_label' => $languageHint === 'ur_mix' ? 'Assistant ko bhejein' : 'Send to assistant',
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
        $trimmed = trim($response);
        $structuredCoaReply = (bool) preg_match(
            '/^\[Form:\s*'.preg_quote(self::COA_FORM_ID, '/').'\]/i',
            $trimmed
        );

        $parsedForm = $this->parseCoaFormReply($response);
        if (is_array($parsedForm)) {
            foreach ($parsedForm as $k => $v) {
                if ($k === 'account_type' && is_string($v) && $v !== '') {
                    $extracted['account_type'] = $v;
                } elseif ($k === 'is_transactional') {
                    $extracted['is_transactional'] = (bool) $v;
                } elseif (in_array($k, ['account_code', 'parent_code'], true) && $v !== '') {
                    $extracted[$k] = is_string($v) ? strtoupper($v) : $v;
                } elseif (in_array($k, ['account_name'], true) && $v !== '') {
                    $extracted[$k] = is_string($v) ? trim($v) : $v;
                }
            }
        }

        $missingFields = $pendingData['missing_fields'] ?? [];

        // Free-text heuristics only — never run on structured form replies or "[Form:]" matches "FORM" as code.
        if (! $structuredCoaReply) {
            foreach ($missingFields as $field) {
                if ($field === 'account_code') {
                    if (preg_match('/\b([A-Z0-9]{2,10})\b/i', $response, $m)) {
                        $extracted['account_code'] = strtoupper($m[1]);
                    }
                } elseif ($field === 'account_name') {
                    if (preg_match('/(?:name|named?|ka naam|---)\s+([A-Za-z\s&]+?)(?:\s*$|under|code)/i', $response, $m)) {
                        $extracted['account_name'] = trim($m[1]);
                    } else {
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
                } elseif ($field === 'account_type') {
                    $typeMap = [
                        'asset' => 'Asset',
                        'liability' => 'Liability',
                        'equity' => 'Equity',
                        'revenue' => 'Revenue',
                        'expense' => 'Expense',
                        'contra' => 'Contra-Asset',
                    ];
                    foreach ($typeMap as $needle => $label) {
                        if (str_contains($normalized, $needle)) {
                            $extracted['account_type'] = $label;
                            break;
                        }
                    }
                }
            }
        }

        $updatedMissing = [];
        if (! $extracted['account_code']) {
            $updatedMissing[] = 'account_code';
        }
        if (! $extracted['account_name']) {
            $updatedMissing[] = 'account_name';
        }
        if (! $extracted['parent_code']) {
            $updatedMissing[] = 'parent_code';
        }
        if (empty($extracted['account_type'])) {
            $updatedMissing[] = 'account_type';
        }

        if (empty($updatedMissing)) {
            return [
                'complete' => true,
                'extracted' => $extracted,
            ];
        }

        $hadForm = $structuredCoaReply || (is_array($parsedForm) && $parsedForm !== []);
        $oldExtracted = $pendingData['extracted'] ?? [];
        $extractedChanged = false;
        foreach (['account_code', 'account_name', 'parent_code', 'account_type', 'is_transactional'] as $k) {
            if (($extracted[$k] ?? null) !== ($oldExtracted[$k] ?? null)) {
                $extractedChanged = true;
                break;
            }
        }

        if (! $hadForm && ! $extractedChanged) {
            return null;
        }

        return [
            'complete' => false,
            'extracted' => $extracted,
            'missing_fields' => $updatedMissing,
        ];
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
