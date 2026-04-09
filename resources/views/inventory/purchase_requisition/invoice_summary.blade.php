<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $pr->pr_number }} — {{ __('inventory_messages.inventory_print.pr_summary_title') }}</title>
    @include('inventory.print.styles')
</head>
<body>
@php
    $estTotal = $pr->lines->sum(function ($l) {
        $q = (float) $l->quantity;
        $p = (float) ($l->estimated_unit_price ?? 0);
        return $q * $p;
    });
    $fmt = static fn ($n) => number_format((float) $n, 2, '.', ',');
@endphp
<div class="doc-shell">
    @include('inventory.print.company')

    <div class="doc-head">
        <div class="doc-head-left">
            <p class="doc-type">{{ __('inventory_messages.inventory_print.pr_summary_title') }}</p>
            <p class="doc-sub">{{ __('inventory_messages.inventory_print.variant_summary') }}</p>
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
                <div class="k">{{ __('inventory_messages.inventory_print.label_required_by') }}</div>
                <div class="v">{{ $pr->required_by_date?->format('Y-m-d') ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_status') }}</div>
                <div class="v">{{ $pr->status }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_priority') }}</div>
                <div class="v">{{ $pr->priority }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_department') }}</div>
                <div class="v">{{ $pr->department?->department_name ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_requesting_location') }}</div>
                <div class="v">{{ $pr->requestingLocation?->location_name ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_currency') }}</div>
                <div class="v">{{ $pr->currency ? ($pr->currency->code.' — '.$pr->currency->name) : '—' }}</div>
            </div>
            <div class="cell">
                <div class="k">{{ __('inventory_messages.inventory_print.label_fx_rate') }}</div>
                <div class="v">{{ $pr->fx_rate !== null && $pr->fx_rate !== '' ? $fmt($pr->fx_rate) : '—' }}</div>
            </div>
        </div>
        @if($pr->requested_by || $pr->justification)
            <div class="row">
                <div class="cell">
                    <div class="k">{{ __('inventory_messages.inventory_print.label_requested_by') }}</div>
                    <div class="v">{{ $pr->requested_by ?: '—' }}</div>
                </div>
                <div class="cell">
                    <div class="k">{{ __('inventory_messages.inventory_print.label_justification') }}</div>
                    <div class="v">{{ $pr->justification ?: '—' }}</div>
                </div>
            </div>
        @endif
    </div>

    @if($pr->notes)
        <div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
            <div class="fld-k">{{ __('inventory_messages.inventory_print.label_notes') }}</div>
            <div class="fld-v">{{ $pr->notes }}</div>
        </div>
    @endif

    <div class="party-row">
        <div>
            <div class="party-box">
                <p class="ph">{{ __('inventory_messages.inventory_print.party_ship_to') }}</p>
                <div class="body">{{ $pr->deliverToLocation?->location_name ?? '—' }}@if($pr->delivery_address)

{{ $pr->delivery_address }}@endif</div>
            </div>
        </div>
        <div>
            <div class="party-box">
                <p class="ph">{{ __('inventory_messages.inventory_print.party_order_address') }}</p>
                <div class="body">{{ __('inventory_messages.inventory_print.label_department') }}: {{ $pr->department?->department_name ?? '—' }}
@if($pr->requested_by)
{{ __('inventory_messages.inventory_print.label_requested_by') }}: {{ $pr->requested_by }}
@endif</div>
            </div>
        </div>
    </div>

    <div class="totals-wrap">
        <table class="totals">
            <tr>
                <th>{{ __('inventory_messages.inventory_print.label_lines_count') }}</th>
                <td>{{ $pr->lines->count() }}</td>
            </tr>
            <tr>
                <th>{{ __('inventory_messages.inventory_print.label_estimated_total') }}</th>
                <td>{{ $fmt($estTotal) }} @if($pr->currency){{ $pr->currency->code }}@endif</td>
            </tr>
        </table>
    </div>

    @include('inventory.print.footer_audit')
</div>
</body>
</html>
