<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $pr->pr_number }} — {{ __('inventory_messages.inventory_print.pr_detailed_title') }}</title>
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
            <p class="doc-type">{{ __('inventory_messages.inventory_print.pr_detailed_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_detailed') }}</p>
        </div>
        <div class="doc-head-right">
            <div class="doc-badge">
                <div class="lbl">{{ __('inventory_messages.inventory_print.label_document_no') }}</div>
                <div class="val">{{ $pr->pr_number }}</div>
            </div>
        </div>
    </div>

    <p class="hint">{{ __('inventory_messages.inventory_print.print_hint') }}</p>

    <div class="meta-grid">
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_date') }}</div>
                <div class="v">{{ $pr->pr_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_status') }}</div>
                <div class="v">{{ $pr->status }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_department') }}</div>
                <div class="v">{{ $pr->department?->department_name ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_deliver_to') }}</div>
                <div class="v">{{ $pr->deliverToLocation?->location_name ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_currency') }}</div>
                <div class="v">{{ $pr->currency?->code ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_priority') }}</div>
                <div class="v">{{ $pr->priority }}</div>
            </div>
        </div>
    </div>

    <table class="data">
        <thead>
        <tr>
            <th>#</th>
            <th>{{ __('inventory_messages.inventory_print.col_item') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_description') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_uom') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_qty') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_est_price') }}</th>
            <th class="num">{{ __('inventory_messages.inventory_print.col_line_total') }}</th>
            <th>{{ __('inventory_messages.inventory_print.col_need_by') }}</th>
        </tr>
        </thead>
        <tbody>
        @foreach($pr->lines as $line)
            @php
                $lt = (float) $line->quantity * (float) ($line->estimated_unit_price ?? 0);
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
                <td class="num">{{ $fmt($line->quantity) }}</td>
                <td class="num">{{ $line->estimated_unit_price !== null ? $fmt($line->estimated_unit_price) : '—' }}</td>
                <td class="num">{{ $fmt($lt) }}</td>
                <td>{{ $line->need_by_date?->format('Y-m-d') ?? '—' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
