<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $invoice->invoice_number }} — {{ __('inventory_messages.inventory_print.si_detailed_title') }}</title>
    @include('inventory.print.styles')
</head>
<body>
@php
    $fmt = static fn ($n) => number_format((float) $n, 2, '.', ',');
    $net = collect($flatLines)->sum(fn ($l) => (float) ($l['line_value'] ?? 0));
    $tax = collect($flatLines)->sum(fn ($l) => (float) ($l['tax_amount'] ?? 0));
    $gross = round($net + $tax, 2);
@endphp
<div class="doc-shell">
    @include('inventory.print.company')

    <div class="doc-head">
        <div class="doc-head-left">
            <p class="doc-type">{{ __('inventory_messages.inventory_print.si_detailed_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_detailed') }}</p>
        </div>
        <div class="doc-head-right">
            <div class="doc-badge">
                <div class="lbl">{{ __('inventory_messages.inventory_print.label_si_invoice_no') }}</div>
                <div class="val">{{ $invoice->invoice_number }}</div>
            </div>
        </div>
    </div>

    <p class="hint">{{ __('inventory_messages.inventory_print.print_hint') }}</p>

    <div class="meta-grid">
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
                <div class="k">{{ __('inventory_messages.inventory_print.label_voucher_date') }}</div>
                <div class="v">{{ $invoice->voucher_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_reference') }}</div>
                <div class="v">{{ $invoice->reference_number ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_status') }}</div>
                <div class="v">{{ $invoice->status }}</div>
            </div>
        </div>
    </div>

    <table class="data compact">
        <thead>
        <tr>
            <th>{{ __('inventory_messages.inventory_print.label_grn_number') }}</th>
            <th>#</th>
            <th>{{ __('inventory_messages.inventory_print.col_item') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_accepted') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_unit_cost') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.label_si_net') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_tax_amount') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.label_si_gross') }}</th>
        </tr>
        </thead>
        <tbody>
        @foreach($flatLines as $row)
            <tr>
                <td class="mono">{{ $row['grn_number'] ?? '—' }}</td>
                <td class="num">{{ $row['line_no'] ?? '—' }}</td>
                <td>
                    <div>{{ $row['item_label'] ?? '—' }}</div>
                    @if(!empty($row['item_description']))
                        <div class="sub">{{ $row['item_description'] }}</div>
                    @endif
                </td>
                <td class="num">{{ $fmt($row['accepted_qty'] ?? 0) }}</td>
                <td class="num">{{ $fmt($row['unit_cost'] ?? 0) }}</td>
                <td class="num">{{ $fmt($row['line_value'] ?? 0) }}</td>
                <td class="num">{{ $fmt($row['tax_amount'] ?? 0) }}</td>
                <td class="num">{{ $fmt($row['line_gross'] ?? 0) }}</td>
            </tr>
        @endforeach
        </tbody>
        <tfoot>
        <tr>
            <th colspan="5" style="text-align: right;">{{ __('inventory_messages.inventory_print.label_totals') }}</th>
            <th class="num">{{ $fmt($net) }}</th>
            <th class="num">{{ $fmt($tax) }}</th>
            <th class="num">{{ $fmt($gross) }}</th>
        </tr>
        </tfoot>
    </table>

    @if($invoice->notes)
        <p class="small" style="margin-top: 12px;"><strong>{{ __('inventory_messages.inventory_print.label_notes') }}:</strong> {{ $invoice->notes }}</p>
    @endif

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
