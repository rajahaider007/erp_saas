<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $transaction->voucher_number ?? $invoice->invoice_number }} — {{ __('inventory_messages.inventory_print.si_voucher_title') }}</title>
    @include('inventory.print.styles')
</head>
<body>
@php
    $fmt = static fn ($n) => number_format((float) $n, 2, '.', ',');
    $sumDr = $entries->sum(fn ($e) => (float) ($e->base_debit_amount ?? $e->debit_amount ?? 0));
    $sumCr = $entries->sum(fn ($e) => (float) ($e->base_credit_amount ?? $e->credit_amount ?? 0));
@endphp
<div class="doc-shell">
    @include('inventory.print.company')

    <div class="doc-head">
        <div class="doc-head-left">
            <p class="doc-type">{{ __('inventory_messages.inventory_print.si_voucher_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_voucher') }}</p>
        </div>
        <div class="doc-head-right">
            <div class="doc-badge">
                <div class="lbl">{{ __('inventory_messages.inventory_print.label_voucher_number') }}</div>
                <div class="val">{{ $transaction->voucher_number ?? '—' }}</div>
            </div>
        </div>
    </div>

    <p class="hint">{{ __('inventory_messages.inventory_print.print_hint') }}</p>

    <div class="meta-grid">
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_si_invoice_no') }}</div>
                <div class="v mono">{{ $invoice->invoice_number }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_voucher_date') }}</div>
                <div class="v">{{ $transaction->voucher_date ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_vendor') }}</div>
                <div class="v">
                    @if($invoice->vendor)
                        {{ $invoice->vendor->account_code }} — {{ $invoice->vendor->account_name }}
                    @else
                        —
                    @endif
                </div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_reference') }}</div>
                <div class="v">{{ $transaction->reference_number ?? $invoice->reference_number ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell" style="grid-column: 1 / -1;">
                <div class="k">{{ __('inventory_messages.inventory_print.label_gl_description') }}</div>
                <div class="v">{{ $transaction->description ?? '—' }}</div>
            </div>
        </div>
    </div>

    <table class="data compact">
        <thead>
        <tr>
            <th class="num">#</th>
            <th>{{ __('inventory_messages.inventory_print.col_account_code') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_account_name') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_description') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_reference') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_debit') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_credit') }}</th>
        </tr>
        </thead>
        <tbody>
        @foreach($entries as $e)
            @php
                $dr = (float) ($e->base_debit_amount ?? $e->debit_amount ?? 0);
                $cr = (float) ($e->base_credit_amount ?? $e->credit_amount ?? 0);
            @endphp
            <tr>
                <td class="num">{{ $e->line_number }}</td>
                <td class="mono">{{ $e->account_code }}</td>
                <td>{{ $e->account_name }}</td>
                <td>{{ $e->description ?? '—' }}</td>
                <td class="mono">{{ $e->reference ?? '—' }}</td>
                <td class="num">{{ $dr > 0 ? $fmt($dr) : '—' }}</td>
                <td class="num">{{ $cr > 0 ? $fmt($cr) : '—' }}</td>
            </tr>
        @endforeach
        </tbody>
        <tfoot>
        <tr>
            <th colspan="5" style="text-align: right;">{{ __('inventory_messages.inventory_print.label_totals') }}</th>
            <th class="num">{{ $fmt($sumDr) }}</th>
            <th class="num">{{ $fmt($sumCr) }}</th>
        </tr>
        </tfoot>
    </table>

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
