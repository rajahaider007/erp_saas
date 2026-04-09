<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $grn->grn_number }} — {{ __('inventory_messages.inventory_print.grn_detailed_title') }}</title>
    @include('inventory.print.styles')
</head>
<body>
@php
    $fmt = static fn ($n) => number_format((float) $n, 2, '.', ',');
@endphp
<div class="doc-shell">
    @include('inventory.print.company')

    <div class="doc-head">
        <div class="doc-head-left">
            <p class="doc-type">{{ __('inventory_messages.inventory_print.grn_detailed_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_detailed') }}</p>
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
                <div class="k">{{ __('inventory_messages.inventory_print.label_document') }}</div>
                <div class="v">{{ $grn->grn_number }} · {{ $grn->grn_type }} · {{ $grn->status }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_date') }}</div>
                <div class="v">{{ $grn->receipt_date?->format('Y-m-d') ?? '—' }}@if($grn->posting_date) / {{ $grn->posting_date->format('Y-m-d') }} @endif</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_po') }}</div>
                <div class="v">{{ $grn->purchaseOrder?->po_number ?? '—' }}</div>
            </div>
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
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_receive_at') }}</div>
                <div class="v">{{ $grn->receiveLocation?->location_name ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_currency') }}</div>
                <div class="v">{{ $grn->currency?->code ?? '—' }}</div>
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
    </div>

    <table class="data compact">
        <thead>
        <tr>
            <th>#</th>
            <th>{{ __('inventory_messages.inventory_print.col_item') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_description') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_uom') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_received') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_unit_cost') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_line_total') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_accepted') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_rejected') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_qc') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_lot') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_mfg_date') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_expiry_date') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_put_away') }}</th>
        </tr>
        </thead>
        <tbody>
        @foreach($grn->lines as $line)
            @php
                $lt = (float) $line->receipt_qty * (float) $line->unit_cost;
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
                <td class="num">{{ $fmt($line->receipt_qty) }}</td>
                <td class="num">{{ $fmt($line->unit_cost) }}</td>
                <td class="num">{{ $fmt($lt) }}</td>
                <td class="num">{{ $line->accepted_qty !== null && $line->accepted_qty !== '' ? $fmt($line->accepted_qty) : '—' }}</td>
                <td class="num">{{ $line->rejected_qty !== null && $line->rejected_qty !== '' ? $fmt($line->rejected_qty) : '—' }}</td>
                <td>{{ $line->qc_line_status ?? '—' }}</td>
                <td>{{ $line->lot_batch_no ?? '—' }}</td>
                <td>{{ $line->manufacturing_date?->format('Y-m-d') ?? '—' }}</td>
                <td>{{ $line->expiry_date?->format('Y-m-d') ?? '—' }}</td>
                <td>{{ $line->putAwayLocation?->location_name ?? '—' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
