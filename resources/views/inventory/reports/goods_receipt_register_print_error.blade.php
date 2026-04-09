<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ __('inventory_messages.reports.grr_report_title') }}</title>
    <style>
        body {
            font-family: system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
            padding: 24px;
            max-width: 480px;
            margin: 0 auto;
        }
        button {
            margin-top: 16px;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 6px;
            border: 1px solid #64748b;
            background: #fff;
        }
    </style>
</head>
<body>
    <p>{{ $message }}</p>
    <button type="button" onclick="window.close()">{{ __('inventory_messages.reports.grr_print_close_tab') }}</button>
</body>
</html>
