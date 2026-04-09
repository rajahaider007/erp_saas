<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $po->po_number }} — {{ __('inventory_messages.inventory_print.po_detailed_title') }}</title>
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
    $fmt = static fn ($n) => number_format((float) $n, 2, '.', ',');
@endphp
<div class="doc-shell">
    @include('inventory.print.company')

    <div class="doc-head">
        <div class="doc-head-left">
            <p class="doc-type">{{ __('inventory_messages.inventory_print.po_detailed_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_detailed') }}</p>
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
                <div class="v">{{ $po->status }} · {{ $po->po_type }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_vendor') }}</div>
                <div class="v">
                    @if($po->vendor)
                        {{ $po->vendor->account_code }} — {{ $po->vendor->account_name }}
                    @else
                        —
                    @endif
                </div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_pr') }}</div>
                <div class="v">{{ $po->purchaseRequisition?->pr_number ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_currency') }}</div>
                <div class="v">{{ $po->currency?->code ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_tax_inclusive') }}</div>
                <div class="v">{{ $po->tax_inclusive ? __('inventory_messages.inventory_print.label_yes') : __('inventory_messages.inventory_print.label_no') }}</div>
            </div>
        </div>
    </div>

    <table class="data compact">
        <thead>
        <tr>
            <th>#</th>
            <th>{{ __('inventory_messages.inventory_print.col_item') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_description') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_uom') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_ordered') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_unit_price') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_discount_pct') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_net_line') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_tax') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_exp_delivery') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_po_received') }}</th>
        </tr>
        </thead>
        <tbody>
        @foreach($po->lines as $line)
            @php
                $net = $lineNet($line);
            @endphp
            <tr>
                <td>{{ $line->line_no }}</td>
                <td>
                    @if($line->inventoryItem)
                        {{ $line->inventoryItem->item_code }}
                    @else
                        {{ $line->inventory_item_id }}
                    @endif
                </td>
                <td>{{ $line->item_description }}</td>
                <td>{{ $line->uom?->uom_code ?? '—' }}</td>
                <td class="num">{{ $fmt($line->ordered_qty) }}</td>
                <td class="num">{{ $fmt($line->unit_price) }}</td>
                <td class="num">{{ $line->line_discount_percent !== null ? $fmt($line->line_discount_percent) : '—' }}</td>
                <td class="num">{{ $fmt($net) }}</td>
                <td>{{ $line->taxCategory ? ($line->taxCategory->tax_code.($line->taxCategory->tax_name ? ' — '.$line->taxCategory->tax_name : '')) : '—' }}</td>
                <td>{{ $line->expected_line_delivery_date?->format('Y-m-d') ?? '—' }}</td>
                <td class="num">{{ $fmt($line->received_qty ?? 0) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <div class="totals-wrap">
        <table class="totals">
            <tr>
                <th>{{ __('inventory_messages.inventory_print.label_po_net_total') }}</th>
                <td>{{ $fmt($po->lines->sum($lineNet)) }} @if($po->currency){{ $po->currency->code }}@endif</td>
            </tr>
        </table>
    </div>

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
