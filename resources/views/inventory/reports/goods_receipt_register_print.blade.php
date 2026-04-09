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
            font-size: 9px;
            color: #111;
            background: #fff;
        }
        h1 { font-size: 16px; margin: 0 0 8px 0; }
        .meta { font-size: 10px; color: #444; margin-bottom: 8px; }
        .scope { font-size: 9px; margin-bottom: 10px; line-height: 1.4; color: #333; }
        .scope div { margin-bottom: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th, td {
            border: 1px solid #bbb;
            padding: 3px 4px;
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
        @page { size: landscape; margin: 10mm; }
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
                <th>{{ __('inventory_messages.reports.grr_col_grn') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_receipt_date') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_posting_date') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_po') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_vendor') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_line') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_item') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_uom') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_receipt_qty') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_accepted_qty') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_rejected_qty') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_unit_cost') }}</th>
                <th class="num">{{ __('inventory_messages.reports.grr_col_line_amount') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_currency') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_lot') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_expiry') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_grn_status') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_posted') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_posted_voucher') }}</th>
                <th>{{ __('inventory_messages.reports.grr_col_match') }}</th>
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
                    <td class="num">{{ $r['rejected_qty'] ?? '' }}</td>
                    <td class="num">{{ number_format((float) $r['unit_cost'], 6, '.', '') }}</td>
                    <td class="num">{{ number_format((float) $r['line_amount'], 2, '.', '') }}</td>
                    <td>{{ $r['currency_code'] ?? '' }}</td>
                    <td>{{ $r['lot_batch_no'] ?? '' }}</td>
                    <td>{{ $r['expiry_date'] }}</td>
                    <td>{{ $r['grn_status'] }}</td>
                    <td>{{ $r['posted'] ? __('inventory_messages.reports.grr_yes') : __('inventory_messages.reports.grr_no') }}</td>
                    <td>{{ $r['posted_transaction_id'] ?? '' }}</td>
                    <td>{{ $r['three_way_match_status'] ?? '' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @if ($truncated)
        <p class="warn">{{ __('inventory_messages.reports.grr_print_truncated_warning', ['shown' => (string) $printRowCap, 'total' => (string) $totalMatching]) }}</p>
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
