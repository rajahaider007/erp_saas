<div class="footer-audit">
    <div class="sig-row">
        <div class="sig-cell">
            <div class="sig-line">{{ __('inventory_messages.inventory_print.sig_prepared_by') }}</div>
        </div>
        <div class="sig-cell">
            <div class="sig-line">{{ __('inventory_messages.inventory_print.sig_approved_by') }}</div>
        </div>
        <div class="sig-cell">
            <div class="sig-line">{{ __('inventory_messages.inventory_print.sig_received_by') }}</div>
        </div>
    </div>
    <p class="disclaimer">{{ __('inventory_messages.inventory_print.footer_disclaimer') }}</p>
    <p class="disclaimer">{{ __('inventory_messages.inventory_print.printed_at', ['when' => now()->timezone(config('app.timezone'))->format('Y-m-d H:i')]) }}</p>
</div>
