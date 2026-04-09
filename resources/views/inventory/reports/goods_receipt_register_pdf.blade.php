<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 7pt; color: #111; }
        h1 { font-size: 14pt; margin: 0 0 6px 0; }
        .meta { font-size: 7pt; color: #333; margin-bottom: 10px; }
        .scope { font-size: 7pt; margin-bottom: 8px; line-height: 1.35; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 3px 4px; vertical-align: top; }
        th { background: #e8e8e8; font-weight: bold; text-align: left; }
        td.num { text-align: right; font-variant-numeric: tabular-nums; }
        .warn { margin-top: 10px; font-size: 7pt; color: #a30; font-weight: bold; }
    </style>
    <title>{{ $title }}</title>
</head>
<body>
    <h1>{{ $title }}</h1>
    <div class="meta">{{ __('inventory_messages.reports.grr_pdf_generated_at', ['at' => $generatedAt]) }}</div>
    <div class="scope">
        @foreach ($scopeLines as $line)
            <div>{{ $line }}</div>
        @endforeach
    </div>
    <table>
        <thead>
            <tr>
                <th>{{ __('inventory_messages.reports.grr_col_grn') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_receipt_date') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_posting_date') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_po') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_vendor') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_line') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_item') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_uom') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_receipt_qty') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_accepted_qty') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_line_amount') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_currency') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_posted') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $r)
                <tr>
                    <td>{{ $r['grn_number'] }}</td>
                    <td>{{ $r['receipt_date'] }}</td>
                    <td>{{ $r['posting_date'] }}</td>
                    <td>{{ $r['po_number'] ?? '' }}</td>
                    <td>{{ ($r['vendor_code'] ?? '') }} — {{ ($r['vendor_name'] ?? '') }}</td>
                    <td class="num">{{ $r['line_no'] }}</td>
                    <td>{{ trim(($r['item_code'] ?? '') . ' ' . ($r['item_name'] ?? '')) }}</td>
                    <td>{{ $r['uom_code'] ?? '' }}</td>
                    <td class="num">{{ $r['receipt_qty'] }}</td>
                    <td class="num">{{ $r['accepted_qty'] }}</td>
                    <td class="num">{{ number_format((float) $r['line_amount'], 2, '.', '') }}</td>
                    <td>{{ $r['currency_code'] ?? '' }}</td>
                    <td>{{ $r['posted'] ? __('inventory_messages.reports.grr_yes') : __('inventory_messages.reports.grr_no') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @if ($truncated)
        <p class="warn">{{ __('inventory_messages.reports.grr_pdf_truncated_warning', ['shown' => (string) $pdfRowCap, 'total' => (string) $totalMatching]) }}</p>
    @endif
</body>
</html>
