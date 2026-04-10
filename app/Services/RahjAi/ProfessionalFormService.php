<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\Validator;

/**
 * Professional Form Entry & Validation Service
 * 
 * Provides:
 * - Smart field validation with helpful error messages
 * - Auto-formatting for different field types
 * - Progressive clarification flow
 * - User-friendly response formatting
 */
class ProfessionalFormService
{
    /**
     * Validate and prepare full form data from user input
     */
    public function validateAndPrepareFormEntry(
        string $formType,
        array $extractedData,
        array $userContext
    ): array {
        $rules = $this->getValidationRules($formType);
        $messages = $this->getFriendlyMessages($formType);

        $validator = Validator::make($extractedData, $rules, $messages);

        if ($validator->fails()) {
            return [
                'success' => false,
                'status' => 'validation_error',
                'errors' => $validator->errors()->toArray(),
                'friendly_message' => $this->formatFriendlyErrors($validator->errors(), $formType),
                'next_step' => 'Please correct the following issues and try again.',
            ];
        }

        // Format all data properly
        $formatted = $this->formatFormData($formType, $validator->validated());

        return [
            'success' => true,
            'status' => 'ready_for_submission',
            'data' => $formatted,
            'summary' => $this->generateFormSummary($formType, $formatted),
            'next_step' => 'Ready to save. Confirm to proceed?',
        ];
    }

    /**
     * Get validation rules for each form type
     */
    protected function getValidationRules(string $formType): array
    {
        return match ($formType) {
            'chart_of_accounts' => [
                'account_code' => 'required|regex:/^[A-Z0-9]{3,20}$/|unique:accounts,code',
                'account_name' => 'required|string|min:2|max:100',
                'account_type' => 'required|in:Asset,Liability,Equity,Revenue,Expense,Contra-Asset',
                'parent_account_id' => 'nullable|exists:accounts,id',
                'is_transactional' => 'boolean',
            ],
            'journal_voucher' => [
                'voucher_date' => 'required|date|before_or_equal:today',
                'reference_number' => 'nullable|string|max:50',
                'description' => 'required|string|min:5|max:500',
                'lines' => 'required|array|min:2',
                'lines.*.account_id' => 'required|exists:accounts,id',
                'lines.*.line_type' => 'required|in:debit,credit',
                'lines.*.amount' => 'required|numeric|min:0.01',
            ],
            'purchase_order' => [
                'po_date' => 'required|date|before_or_equal:today',
                'supplier_id' => 'required|exists:suppliers,id',
                'expected_delivery_date' => 'required|date|after:po_date',
                'lines' => 'required|array|min:1',
                'lines.*.item_id' => 'required|exists:items,id',
                'lines.*.quantity' => 'required|numeric|min:1',
                'lines.*.unit_price' => 'required|numeric|min:0.01',
            ],
            'goods_receipt' => [
                'receipt_date' => 'required|date|before_or_equal:today',
                'po_reference' => 'required|exists:purchase_orders,po_number',
                'lines' => 'required|array|min:1',
                'lines.*.item_id' => 'required|exists:items,id',
                'lines.*.received_qty' => 'required|numeric|min:0',
            ],
            default => [],
        };
    }

    /**
     * Get user-friendly validation messages
     */
    protected function getFriendlyMessages(string $formType): array
    {
        return match ($formType) {
            'chart_of_accounts' => [
                'account_code.required' => 'Account code is required (e.g., COGS, RENT)',
                'account_code.regex' => 'Code must be 3-20 uppercase letters/numbers (e.g., COGS)',
                'account_code.unique' => 'This code already exists. Please use a different code.',
                'account_name.required' => 'Account name is required (e.g., Cost of Goods Sold)',
                'account_name.min' => 'Account name must be at least 2 characters',
                'account_type.required' => 'Account type is required (Asset, Liability, Equity, Revenue, Expense)',
                'account_type.in' => 'Invalid account type. Choose from: Asset, Liability, Equity, Revenue, Expense, Contra-Asset',
                'parent_account_id.exists' => 'Parent account does not exist',
            ],
            'journal_voucher' => [
                'voucher_date.required' => 'Voucher date is required',
                'voucher_date.date' => 'Invalid date format',
                'voucher_date.before_or_equal' => 'Voucher date cannot be in the future',
                'description.required' => 'Description is required (e.g., Monthly rent payment)',
                'description.min' => 'Description must be at least 5 characters',
                'lines.required' => 'At least 2 transaction lines are required (debit and credit)',
                'lines.min' => 'Journal voucher must have at least 2 lines',
            ],
            'purchase_order' => [
                'po_date.required' => 'PO date is required',
                'supplier_id.required' => 'Supplier must be selected',
                'supplier_id.exists' => 'Selected supplier does not exist',
                'expected_delivery_date.required' => 'Expected delivery date is required',
                'expected_delivery_date.after' => 'Delivery date must be after PO date',
                'lines.required' => 'At least 1 item line is required',
                'lines.*.quantity.min' => 'Quantity must be at least 1',
                'lines.*.unit_price.min' => 'Unit price must be greater than 0',
            ],
            default => [],
        };
    }

    /**
     * Format all data to proper types and precision
     */
    protected function formatFormData(string $formType, array $data): array
    {
        return match ($formType) {
            'chart_of_accounts' => [
                'account_code' => strtoupper(trim($data['account_code'])),
                'account_name' => trim($data['account_name']),
                'account_type' => $data['account_type'],
                'parent_account_id' => $data['parent_account_id'] ?? null,
                'is_transactional' => $data['is_transactional'] ?? true,
                'description' => $data['description'] ?? null,
            ],
            'journal_voucher' => [
                'voucher_date' => $data['voucher_date'],
                'reference_number' => $data['reference_number'] ?? null,
                'description' => trim($data['description']),
                'lines' => array_map(fn($line) => [
                    'account_id' => $line['account_id'],
                    'line_type' => strtolower($line['line_type']),
                    'amount' => round($line['amount'], 2),
                    'description' => trim($line['description'] ?? ''),
                ], $data['lines']),
            ],
            'purchase_order' => [
                'po_date' => $data['po_date'],
                'supplier_id' => $data['supplier_id'],
                'expected_delivery_date' => $data['expected_delivery_date'],
                'po_type' => $data['po_type'] ?? 'standard',
                'lines' => array_map(fn($line) => [
                    'item_id' => $line['item_id'],
                    'quantity' => (int) $line['quantity'],
                    'unit_price' => round($line['unit_price'], 2),
                    'amount' => round($line['quantity'] * $line['unit_price'], 2),
                ], $data['lines']),
                'total_amount' => round(array_sum(array_map(
                    fn($line) => $line['quantity'] * $line['unit_price'],
                    $data['lines']
                )), 2),
            ],
            default => $data,
        };
    }

    /**
     * Generate a user-friendly summary of the form
     */
    protected function generateFormSummary(string $formType, array $data): string
    {
        return match ($formType) {
            'chart_of_accounts' => "
✅ Chart of Accounts Entry Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Code: {$data['account_code']}
📋 Name: {$data['account_name']}
🔖 Type: {$data['account_type']}
🔗 Transactional: " . ($data['is_transactional'] ? 'Yes' : 'No') . "

Ready to save? Confirm below.",

            'journal_voucher' => "
✅ Journal Voucher Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date: {$data['voucher_date']}
💬 Description: {$data['description']}
📍 Reference: {$data['reference_number'] ?: '(None)'}
📊 Lines: " . count($data['lines']) . " entries

Total Debit: PKR " . number_format(array_sum(array_filter(
    array_map(fn($l) => $l['line_type'] === 'debit' ? $l['amount'] : 0, $data['lines'])
)), 2) . "
Total Credit: PKR " . number_format(array_sum(array_filter(
    array_map(fn($l) => $l['line_type'] === 'credit' ? $l['amount'] : 0, $data['lines'])
)), 2) . "

Ready to save? Confirm below.",

            'purchase_order' => "
✅ Purchase Order Summary
━━━━━━━━━━━━━━━━━━━━━━━━━
📅 PO Date: {$data['po_date']}
📦 Items: " . count($data['lines']) . " lines
💰 Total: PKR " . number_format($data['total_amount'], 2) . "
📬 Expected Delivery: {$data['expected_delivery_date']}

Ready to save? Confirm below.",

            default => "Form is ready to submit.",
        };
    }

    /**
     * Format validation errors in a user-friendly way
     */
    protected function formatFriendlyErrors($errors, string $formType): string
    {
        $message = "⚠️ Please fix the following issues:\n\n";

        foreach ($errors->messages() as $field => $fieldErrors) {
            $message .= "• **{$field}**: " . implode("; ", $fieldErrors) . "\n";
        }

        return $message;
    }

    /**
     * Get missing required fields for progressive clarification
     */
    public function getMissingFields(string $formType, array $providedData): array
    {
        $rules = $this->getValidationRules($formType);
        $missing = [];

        foreach ($rules as $field => $rule) {
            if (str_starts_with($rule, 'required')) {
                if (!isset($providedData[$field]) || $providedData[$field] === null || $providedData[$field] === '') {
                    $missing[] = $field;
                }
            }
        }

        return $missing;
    }

    /**
     * Get helpful prompts for missing fields
     */
    public function getFieldPrompt(string $formType, string $fieldName): string
    {
        return match ($formType . '::' . $fieldName) {
            'chart_of_accounts::account_code' => 'What is the 3-20 character account code? (e.g., RENT, COGS, CASH)',
            'chart_of_accounts::account_name' => 'What is the full account name? (e.g., Rent Expense)',
            'chart_of_accounts::account_type' => 'What type of account? (Asset, Liability, Equity, Revenue, Expense, Contra-Asset)',
            'journal_voucher::voucher_date' => 'What is the voucher date? (YYYY-MM-DD format)',
            'journal_voucher::description' => 'Describe the transaction (e.g., Monthly rent payment to landlord)',
            'purchase_order::supplier_id' => 'Which supplier? (Provide supplier name or ID)',
            'purchase_order::expected_delivery_date' => 'When should the goods arrive? (YYYY-MM-DD format)',
            default => "Please provide the {$fieldName}",
        };
    }
}
