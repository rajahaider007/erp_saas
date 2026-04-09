<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $grn->grn_number }} — {{ __('inventory_messages.inventory_print.grn_summary_title') }}</title>
    @include('inventory.print.styles')
</head>
<body>
@php
    $receiptVal = $grn->lines->sum(fn ($l) => (float) $l->receipt_qty * (float) $l->unit_cost);
    $acceptedVal = $grn->lines->sum(function ($l) {
        $a = $l->accepted_qty !== null && $l->accepted_qty !== '' ? (float) $l->accepted_qty : (float) $l->receipt_qty;
        return $a * (float) $l->unit_cost;
    });
    $fmt = static fn ($n) => number_format((float) $n, 2, '.', ',');
    $logistics = array_filter([
        $grn->vehicle_number ? __('inventory_messages.inventory_print.label_vehicle').': '.$grn->vehicle_number : null,
        $grn->transporter_name ? __('inventory_messages.inventory_print.label_transporter').': '.$grn->transporter_name : null,
        $grn->bol_awb ? __('inventory_messages.inventory_print.label_bol_awb').': '.$grn->bol_awb : null,
        $grn->container_number ? __('inventory_messages.inventory_print.label_container').': '.$grn->container_number : null,
        $grn->seal_number ? __('inventory_messages.inventory_print.label_seal').': '.$grn->seal_number : null,
        $grn->packing_list_ref ? __('inventory_messages.inventory_print.label_packing_list').': '.$grn->packing_list_ref : null,
    ]);
@endphp
<div class="doc-shell">
    @include('inventory.print.company')

    <div class="doc-head">
        <div class="doc-head-left">
            <p class="doc-type">{{ __('inventory_messages.inventory_print.grn_summary_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_summary') }}</p>
        </div>
        <div class="doc-head-right">
            <div class="doc-badge">
                <div class="lbl">{{ __('inventory_messages.inventory_print.label_document_no') }}</div>
                <div class="val">{{ $grn->grn_number }}</div>
            </div>
        </div>
    </div>

    <p class="hint">{{ __('inventory_messages.inventory_print.print_hint') }}</p>

    <div class="meta-grid">
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_receipt_type') }}</div>
                <div class="v">{{ $grn->grn_type }} · {{ $grn->status }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_date') }}</div>
                <div class="v">{{ $grn->receipt_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_posting_date') }}</div>
                <div class="v">{{ $grn->posting_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_po') }}</div>
                <div class="v">{{ $grn->purchaseOrder?->po_number ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_vendor') }}</div>
                <div class="v">
                    @if($grn->vendor)
                        {{ $grn->vendor->account_code }} — {{ $grn->vendor->account_name }}
                    @else
                        —
                    @endif
                </div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_receive_at') }}</div>
                <div class="v">{{ $grn->receiveLocation?->location_name ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_currency') }}</div>
                <div class="v">{{ $grn->currency ? ($grn->currency->code.' — '.$grn->currency->name) : '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_fx_rate') }}</div>
                <div class="v">{{ $grn->fx_rate !== null && $grn->fx_rate !== '' ? $fmt($grn->fx_rate) : '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_dn') }}</div>
                <div class="v">{{ $grn->vendor_delivery_note_no ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_three_way_match') }}</div>
                <div class="v">{{ $grn->three_way_match_status ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_landed_cost') }}</div>
                <div class="v">{{ $grn->landed_cost_applies ? ($grn->landed_cost_reference ?? __('inventory_messages.inventory_print.label_yes')) : __('inventory_messages.inventory_print.label_no') }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_overall_qc') }}</div>
                <div class="v">{{ $grn->overall_qc_status ?? '—' }}</div>
            </div>
        </div>
    </div>

    @if(count($logistics))
        <div style="margin-bottom:12px;">
            <div class="fld-k">{{ __('inventory_messages.inventory_print.label_transport') }}</div>
            <div class="fld-v">{{ implode(' · ', $logistics) }}</div>
        </div>
    @endif

    <div class="party-row">
        <div>
            <div class="party-box">
                <p class="ph">{{ __('inventory_messages.inventory_print.party_supplier') }}</p>
                <div class="body">@if($grn->vendor)
                    {{ $grn->vendor->account_code }} — {{ $grn->vendor->account_name }}
                @else
                    —
                @endif</div>
            </div>
        </div>
        <div>
            <div class="party-box">
                <p class="ph">{{ __('inventory_messages.inventory_print.label_receive_at') }}</p>
                <div class="body">{{ $grn->receiveLocation?->location_name ?? '—' }}</div>
            </div>
        </div>
    </div>

    @if($grn->notes)
        <div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
            <div class="fld-k">{{ __('inventory_messages.inventory_print.label_notes') }}</div>
            <div class="fld-v">{{ $grn->notes }}</div>
        </div>
    @endif

    <div class="totals-wrap">
        <table class="totals">
            <tr>
                <th>{{ __('inventory_messages.inventory_print.label_lines_count') }}</th>
                <td>{{ $grn->lines->count() }}</td>
            </tr>
            <tr>
                <th>{{ __('inventory_messages.inventory_print.label_grand_total') }}</th>
                <td>{{ $fmt($receiptVal) }} @if($grn->currency){{ $grn->currency->code }}@endif</td>
            </tr>
            <tr>
                <th>{{ __('inventory_messages.inventory_print.label_accepted_total') }}</th>
                <td>{{ $fmt($acceptedVal) }} @if($grn->currency){{ $grn->currency->code }}@endif</td>
            </tr>
        </table>
    </div>

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
