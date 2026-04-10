<?php

/**
 * Accounts dashboard financial snapshots for RAHJ AI (read-only tools).
 *
 * Order matters: first matching intent wins. Tune keywords here instead of adding new PHP branches.
 * Mirrors AccountsDashboardController::getAccountsByDashboardType report_type keys.
 */
return [
    'intents' => [
        [
            'intent' => 'bank_balances',
            'report_type' => 'bank-balances',
            'report_path' => '/accounts/dashboard-report/bank-balances',
            'answer_title' => 'Bank balances',
            'empty_account_hint' => 'Koi bank account `account_configurations` (type **bank**) ke saath map nahi mila. Pehle COA / account configuration mein bank accounts assign karein.',
            'must_contain_all' => [
                ['bank', 'baink', 'betweenk', 'بینک'],
                ['balance', 'balances', 'balanc', 'بیلنس', 'kitna', 'btao', 'بتاؤ'],
            ],
        ],
        [
            'intent' => 'all_cash_balances',
            'report_type' => 'all-cash-codes',
            'report_path' => '/accounts/dashboard-report/all-cash-codes',
            'answer_title' => 'All cash codes (cash + petty + bank)',
            'empty_account_hint' => 'Is scope mein koi cash/petty/bank mapped account nahi mila.',
            'must_contain_all' => [
                ['all cash', 'all-cash', 'sab cash', 'tamam cash', 'cash codes', 'har cash', 'تمام کیش'],
                ['balance', 'balances', 'balanc', 'بیلنس', 'kitna', 'btao', 'بتاؤ', 'summary', 'snapshot'],
            ],
        ],
        [
            'intent' => 'cash_balances',
            'report_type' => 'current-cash',
            'report_path' => '/accounts/dashboard-report/current-cash',
            'answer_title' => 'Cash in hand / petty cash',
            'empty_account_hint' => 'Koi cash/petty account `account_configurations` (types **cash** / **petty_cash**) ke saath map nahi mila.',
            'must_contain_all' => [
                ['cash', 'petty', 'نقد', 'in hand', 'inhand', 'counter', 'drawer', 'till', 'کیش'],
                ['balance', 'balances', 'balanc', 'بیلنس', 'kitna', 'btao', 'بتاؤ', 'hand'],
            ],
        ],
        [
            'intent' => 'main_payable',
            'report_type' => 'main-payable',
            'report_path' => '/accounts/dashboard-report/main-payable',
            'answer_title' => 'Main payable (AP)',
            'empty_account_hint' => 'Koi accounts-payable mapped account nahi mila.',
            'must_contain_all' => [
                ['main payable', 'accounts payable', 'supplier payable', 'ap balance', 'creditors balance', 'سپلائر'],
                ['balance', 'balances', 'snapshot', 'summary', 'total', 'kitna', 'btao', 'بتاؤ', 'outstanding'],
            ],
        ],
        [
            'intent' => 'main_receivable',
            'report_type' => 'main-receivable',
            'report_path' => '/accounts/dashboard-report/main-receivable',
            'answer_title' => 'Main receivable (AR)',
            'empty_account_hint' => 'Koi accounts-receivable mapped account nahi mila.',
            'must_contain_all' => [
                ['main receivable', 'accounts receivable', 'customer receivable', 'debtors balance', 'ar balance'],
                ['balance', 'balances', 'snapshot', 'summary', 'total', 'kitna', 'btao', 'بتاؤ', 'outstanding'],
            ],
        ],
    ],
];
