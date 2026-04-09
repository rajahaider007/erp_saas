<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $po->po_number }} — {{ __('inventory_messages.inventory_print.po_summary_title') }}</title>
    @include('inventory.print.styles')
</head>
<body>
@php
    $lineNet = static function ($l) {
        $q = (float) $l->ordered_qty;
        $p = (float) $l->unit_price;
        $d = (float) ($l->line_discount_percent ?? 0);
        return $q * $p * (1 - $d / 100);
    };
    $netTotal = $po->lines->sum($lineNet);
    $fmt = static fn ($n) => number_format((float) $n, 2, '.', ',');
    $incoterms = trim(implode(' ', array_filter([$po->incoterms, $po->incoterms_location])));
@endphp
<div class="doc-shell">
    @include('inventory.print.company')

    <div class="doc-head">
        <div class="doc-head-left">
            <p class="doc-type">{{ __('inventory_messages.inventory_print.po_summary_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_summary') }} · {{ $po->po_type }}@if($po->is_blanket) · blanket @endif</p>
        </div>
        <div class="doc-head-right">
            <div class="doc-badge">
                <div class="lbl">{{ __('inventory_messages.inventory_print.label_document_no') }}</div>
                <div class="val">{{ $po->po_number }}</div>
            </div>
        </div>
    </div>

    <p class="hint">{{ __('inventory_messages.inventory_print.print_hint') }}</p>

    <div class="meta-grid">
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_date') }}</div>
                <div class="v">{{ $po->po_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_status') }}</div>
                <div class="v">{{ $po->status }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_expected_delivery') }}</div>
                <div class="v">{{ $po->expected_delivery_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_pr') }}</div>
                <div class="v">{{ $po->purchaseRequisition?->pr_number ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_currency') }}</div>
                <div class="v">{{ $po->currency ? ($po->currency->code.' — '.$po->currency->name) : '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_fx_rate') }}</div>
                <div class="v">{{ $po->fx_rate !== null && $po->fx_rate !== '' ? $fmt($po->fx_rate) : '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_incoterms') }}</div>
                <div class="v">{{ $incoterms !== '' ? $incoterms : '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_payment_terms') }}</div>
                <div class="v">{{ $po->payment_terms ?: '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_tax_inclusive') }}</div>
                <div class="v">{{ $po->tax_inclusive ? __('inventory_messages.inventory_print.label_yes') : __('inventory_messages.inventory_print.label_no') }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_ordering_location') }}</div>
                <div class="v">{{ $po->orderingLocation?->location_name ?? '—' }}</div>
            </div>
        </div>
        @if($po->vendor_reference)
            <div class="row">
                <div class="cell">
                    <div class="k">{{ __('inventory_messages.inventory_print.label_vendor_reference') }}</div>
                    <div class="v">{{ $po->vendor_reference }}</div>
                </div>
                <div class="cell"></div>
            </div>
        @endif
    </div>

    <div class="party-row">
        <div>
            <div class="party-box">
                <p class="ph">{{ __('inventory_messages.inventory_print.party_supplier') }}</p>
                <div class="body">@if($po->vendor)
                    {{ $po->vendor->account_code }} — {{ $po->vendor->account_name }}
                @else
                    —
                @endif</div>
            </div>
        </div>
        <div>
            <div class="party-box">
                <p class="ph">{{ __('inventory_messages.inventory_print.party_ship_to') }}</p>
                <div class="body">{{ $po->shipToLocation?->location_name ?? '—' }}@if($po->delivery_address)

{{ $po->delivery_address }}@endif</div>
            </div>
        </div>
    </div>

    @if($po->notes)
        <div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
            <div class="fld-k">{{ __('inventory_messages.inventory_print.label_notes') }}</div>
            <div class="fld-v">{{ $po->notes }}</div>
        </div>
    @endif

    <div class="totals-wrap">
        <table class="totals">
            <tr>
                <th>{{ __('inventory_messages.inventory_print.label_lines_count') }}</th>
                <td>{{ $po->lines->count() }}</td>
            </tr>
            <tr>
                <th>{{ __('inventory_messages.inventory_print.label_po_net_total') }}</th>
                <td>{{ $fmt($netTotal) }} @if($po->currency){{ $po->currency->code }}@endif</td>
            </tr>
        </table>
    </div>

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
