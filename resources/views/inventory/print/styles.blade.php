{{-- Shared print styles for procurement documents (PR / PO / GRN), PDF-friendly --}}
<style>
    @page {
        size: A4;
        margin: 12mm 14mm;
    }
    * { box-sizing: border-box; }
    body {
        font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
        font-size: 10px;
        line-height: 1.45;
        color: #0f172a;
        margin: 0;
        padding: 0;
    }
    .doc-shell { max-width: 190mm; margin: 0 auto; }
    .brand-bar {
        border-bottom: 2px solid #1e3a5f;
        padding-bottom: 10px;
        margin-bottom: 12px;
    }
    .company-legal {
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: #1e3a5f;
        margin: 0 0 4px;
    }
    .company-meta, .small {
        font-size: 9px;
        color: #475569;
        margin: 0;
    }
    .company-reg {
        margin-top: 6px;
        font-size: 9px;
        color: #334155;
    }
    .doc-head {
        display: table;
        width: 100%;
        margin-bottom: 12px;
    }
    .doc-head-left, .doc-head-right {
        display: table-cell;
        vertical-align: top;
    }
    .doc-head-right { width: 38%; text-align: right; }
    .doc-type {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #334155;
        margin: 0 0 2px;
    }
    .doc-sub { font-size: 9px; color: #64748b; margin: 0; }
    .doc-badge {
        display: inline-block;
        border: 1px solid #cbd5e1;
        background: #f8fafc;
        padding: 8px 12px;
        text-align: right;
        min-width: 11rem;
    }
    .doc-badge .lbl {
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #64748b;
    }
    .doc-badge .val {
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
        margin-top: 2px;
    }
    .meta-grid {
        display: table;
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin-bottom: 12px;
    }
    .meta-grid .row { display: table-row; }
    .meta-grid .cell {
        display: table-cell;
        width: 50%;
        vertical-align: top;
        padding: 2px 12px 8px 0;
        border-bottom: 1px solid #e2e8f0;
    }
    .meta-grid .cell:nth-child(2) { padding-right: 0; padding-left: 12px; }
    .meta-grid .k {
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 2px;
    }
    .meta-grid .v { font-size: 10px; color: #0f172a; }
    .fld-k {
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 2px;
    }
    .fld-v { font-size: 10px; color: #0f172a; }
    .party-row {
        display: table;
        width: 100%;
        margin-bottom: 12px;
    }
    .party-row > div {
        display: table-cell;
        width: 50%;
        vertical-align: top;
        padding-right: 10px;
    }
    .party-row > div:last-child { padding-right: 0; padding-left: 10px; }
    .party-box {
        border: 1px solid #e2e8f0;
        background: #fafbfc;
        padding: 10px 12px;
        min-height: 4.5rem;
    }
    .party-box .ph {
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #64748b;
        margin: 0 0 6px;
    }
    .party-box .body { font-size: 10px; color: #0f172a; white-space: pre-line; }
    table.data {
        width: 100%;
        border-collapse: collapse;
        font-size: 9px;
        margin-bottom: 10px;
    }
    table.data th, table.data td {
        border: 1px solid #cbd5e1;
        padding: 5px 6px;
        vertical-align: top;
    }
    table.data th {
        background: #e2e8f0;
        font-weight: 700;
        text-align: left;
        color: #1e293b;
    }
    table.data .num { text-align: right; white-space: nowrap; }
    table.data tbody tr:nth-child(even) { background: #f8fafc; }
    table.data.compact { font-size: 8px; }
    table.data.compact th, table.data.compact td { padding: 3px 4px; }
    .totals-wrap { margin-top: 8px; }
    table.totals {
        margin-left: auto;
        border-collapse: collapse;
        min-width: 14rem;
        font-size: 10px;
    }
    table.totals th, table.totals td {
        padding: 6px 10px;
        border: 1px solid #cbd5e1;
    }
    table.totals th {
        text-align: left;
        background: #f1f5f9;
        font-weight: 600;
    }
    table.totals td { text-align: right; font-weight: 600; }
    .hint {
        font-size: 9px;
        color: #64748b;
        margin: 0 0 12px;
    }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    table.data td .sub { font-size: 8px; color: #64748b; margin-top: 2px; }
    .footer-audit {
        margin-top: 18px;
        padding-top: 12px;
        border-top: 1px solid #e2e8f0;
    }
    .sig-row {
        display: table;
        width: 100%;
        margin-top: 14px;
    }
    .sig-cell {
        display: table-cell;
        width: 33%;
        padding-right: 12px;
        vertical-align: bottom;
    }
    .sig-cell:last-child { padding-right: 0; }
    .sig-line {
        border-top: 1px solid #94a3b8;
        padding-top: 4px;
        font-size: 8px;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    .disclaimer {
        font-size: 8px;
        color: #94a3b8;
        margin: 12px 0 0;
    }
    @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
    }
</style>
