<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $invoice->invoice_number }} — {{ __('inventory_messages.inventory_print.si_summary_title') }}</title>
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
            <p class="doc-type">{{ __('inventory_messages.inventory_print.si_summary_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_summary') }}</p>
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
                <div class="k">{{ __('inventory_messages.inventory_print.label_status') }}</div>
                <div class="v">{{ $invoice->status }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_voucher_date') }}</div>
                <div class="v">{{ $invoice->voucher_date?->format('Y-m-d') ?? '—' }}</div>
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
                <div class="v">{{ $invoice->reference_number ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_supplier_invoice_date') }}</div>
                <div class="v">{{ $invoice->supplier_invoice_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_due_date') }}</div>
                <div class="v">{{ $invoice->due_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
        </div>
        @if($invoice->description)
            <div class="row">
                <div class="cell" style="grid-column: 1 / -1;">
                    <div class="k">{{ __('inventory_messages.inventory_print.label_description') }}</div>
                    <div class="v">{{ $invoice->description }}</div>
                </div>
            </div>
        @endif
        @if($postedVoucher)
            <div class="row">
                <div class="cell">
                    <div class="k">{{ __('inventory_messages.inventory_print.label_voucher_number') }}</div>
                    <div class="v mono">{{ $postedVoucher->voucher_number ?? '—' }}</div>
                </div>
                <div class="cell">
                    <div class="k">{{ __('inventory_messages.inventory_print.label_gl_voucher_date') }}</div>
                    <div class="v">{{ $postedVoucher->voucher_date ?? '—' }}</div>
                </div>
            </div>
        @endif
    </div>

    <p class="doc-type" style="margin-top: 14px;">{{ __('inventory_messages.inventory_print.label_linked_grns') }}</p>
    <table class="data compact">
        <thead>
        <tr>
            <th>{{ __('inventory_messages.inventory_print.label_grn_number') }}</th>
            <th>{{ __('inventory_messages.inventory_print.label_date') }}</th>
            <th>{{ __('inventory_messages.inventory_print.label_po') }}</th>
        </tr>
        </thead>
        <tbody>
        @foreach($grns as $g)
            <tr>
                <td class="mono">{{ $g->grn_number }}</td>
                <td>{{ $g->receipt_date?->format('Y-m-d') ?? '—' }}</td>
                <td>{{ $g->purchaseOrder?->po_number ?? '—' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <div class="meta-grid" style="margin-top: 1.25rem;">
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_si_net') }}</div>
                <div class="v num">{{ $fmt($net) }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_si_tax') }}</div>
                <div class="v num">{{ $fmt($tax) }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_si_gross') }}</div>
                <div class="v num"><strong>{{ $fmt($gross) }}</strong></div>
            </div>
        </div>
    </div>

    @if($invoice->notes)
        <p class="small" style="margin-top: 12px;"><strong>{{ __('inventory_messages.inventory_print.label_notes') }}:</strong> {{ $invoice->notes }}</p>
    @endif

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
