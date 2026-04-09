<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 16px;
            font-family: system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
            font-size: 8px;
            color: #111;
            background: #fff;
        }
        h1 { font-size: 15px; margin: 0 0 8px 0; }
        .meta { font-size: 10px; color: #444; margin-bottom: 8px; }
        .scope { font-size: 9px; margin-bottom: 10px; line-height: 1.4; color: #333; }
        .scope div { margin-bottom: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th, td {
            border: 1px solid #bbb;
            padding: 2px 3px;
            vertical-align: top;
            word-break: break-word;
        }
        th {
            background: #e8e8e8;
            font-weight: 600;
            text-align: left;
        }
        td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
        .warn { margin-top: 12px; font-size: 9px; color: #a30; font-weight: 600; }
        .no-print {
            margin-bottom: 12px;
            padding: 10px 12px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 12px;
            color: #334155;
        }
        .no-print button {
            margin-top: 8px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            border-radius: 6px;
            border: 1px solid #64748b;
            background: #fff;
        }
        @page { size: landscape; margin: 8mm; }
        @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
            th { background: #eee !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <div>{{ __('inventory_messages.reports.grr_print_screen_hint') }}</div>
        <button type="button" onclick="window.close()">{{ __('inventory_messages.reports.grr_print_close_tab') }}</button>
    </div>

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
                <th>{{ __('inventory_messages.reports.pol_col_po') }}</th>
                <th>{{ __('inventory_messages.reports.pol_col_po_date') }}</th>
                <th>{{ __('inventory_messages.reports.pol_col_expected') }}</th>
                <th>{{ __('inventory_messages.reports.pol_col_vendor') }}</th>
                <th class="num">{{ __('inventory_messages.reports.pol_col_line') }}</th>
                <th>{{ __('inventory_messages.reports.pol_col_item') }}</th>
                <th>{{ __('inventory_messages.reports.pol_col_uom') }}</th>
                <th class="num">{{ __('inventory_messages.reports.pol_col_ordered') }}</th>
                <th class="num">{{ __('inventory_messages.reports.pol_col_received') }}</th>
                <th class="num">{{ __('inventory_messages.reports.pol_col_balance') }}</th>
                <th class="num">{{ __('inventory_messages.reports.pol_col_unit_price') }}</th>
                <th class="num">{{ __('inventory_messages.reports.pol_col_discount_pct') }}</th>
                <th class="num">{{ __('inventory_messages.reports.pol_col_net_unit') }}</th>
                <th class="num">{{ __('inventory_messages.reports.pol_col_open_value') }}</th>
                <th>{{ __('inventory_messages.reports.pol_col_currency') }}</th>
                <th>{{ __('inventory_messages.reports.pol_col_line_status') }}</th>
                <th>{{ __('inventory_messages.reports.pol_col_po_status') }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $r)
                <tr>
                    <td>{{ $r['po_number'] }}</td>
                    <td>{{ $r['po_date'] }}</td>
                    <td>{{ $r['expected_delivery_date'] }}</td>
                    <td>{{ ($r['vendor_code'] ?? '') }} — {{ ($r['vendor_name'] ?? '') }}</td>
                    <td class="num">{{ $r['line_no'] }}</td>
                    <td>{{ trim(($r['item_code'] ?? '') . ' ' . ($r['item_name'] ?? '')) }}</td>
                    <td>{{ $r['uom_code'] ?? '' }}</td>
                    <td class="num">{{ $r['ordered_qty'] }}</td>
                    <td class="num">{{ $r['received_qty'] }}</td>
                    <td class="num">{{ $r['balance_qty'] }}</td>
                    <td class="num">{{ number_format((float) $r['unit_price'], 6, '.', '') }}</td>
                    <td class="num">{{ number_format((float) $r['line_discount_percent'], 2, '.', '') }}</td>
                    <td class="num">{{ number_format((float) $r['net_unit_price'], 6, '.', '') }}</td>
                    <td class="num">{{ number_format((float) $r['open_line_value'], 2, '.', '') }}</td>
                    <td>{{ $r['currency_code'] ?? '' }}</td>
                    <td>{{ $r['line_status'] ?? '' }}</td>
                    <td>{{ $r['po_status'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @if ($truncated)
        <p class="warn">{{ __('inventory_messages.reports.pol_print_truncated_warning', ['shown' => (string) $printRowCap, 'total' => (string) $totalMatching]) }}</p>
    @endif

    <script>
        (function () {
            function triggerPrint() {
                window.print();
            }
            window.addEventListener('load', function () {
                setTimeout(triggerPrint, 300);
            });
            window.addEventListener('afterprint', function () {
                window.close();
            });
        })();
    </script>
</body>
</html>
