@php
    $show = isset($company) && $company;
@endphp
@if($show)
    @php
        $legal = $company->legal_name
            ?: ($company->trading_name ?: $company->company_name);
        $addr = array_filter([
            $company->address_line_1 ?? null,
            $company->address_line_2 ?? null,
            trim(implode(' ', array_filter([
                $company->city ?? null,
                $company->state_province ?? null,
                $company->postal_code ?? null,
            ]))),
            $company->country ?? null,
        ]);
        $contact = array_filter([
            $company->phone ? __('inventory_messages.inventory_print.contact_phone', ['v' => $company->phone]) : null,
            $company->email ? __('inventory_messages.inventory_print.contact_email', ['v' => $company->email]) : null,
        ]);
    @endphp
    <div class="brand-bar">
        <p class="company-legal">{{ $legal }}</p>
        @if(count($addr))
            <p class="company-meta">{{ implode(' · ', $addr) }}</p>
        @endif
        @if(count($contact))
            <p class="company-meta">{{ implode(' · ', $contact) }}</p>
        @endif
        <div class="company-reg">
            @if(!empty($company->registration_number))
                <span>{{ __('inventory_messages.inventory_print.reg_no') }} {{ $company->registration_number }}</span>
            @endif
            @if(!empty($company->tax_id))
                <span>@if(!empty($company->registration_number)) · @endif{{ __('inventory_messages.inventory_print.tax_id') }} {{ $company->tax_id }}</span>
            @endif
            @if(!empty($company->vat_number))
                <span> · {{ __('inventory_messages.inventory_print.vat_id') }} {{ $company->vat_number }}</span>
            @endif
        </div>
    </div>
@endif
