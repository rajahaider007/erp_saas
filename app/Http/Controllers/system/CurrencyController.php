<?php

namespace App\Http\Controllers\system;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\Currency;
use App\Models\CurrencyExchangeRateHistory;
use App\Services\ExchangeRateService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    use CheckUserPermissions;
    /**
     * Display a listing of the currencies.
     */
    public function index()
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        $currencies = Currency::ordered()
            ->paginate(50);

        return Inertia::render('system/Currencies/Index', [
            'currencies' => $currencies
        ]);
    }

    /**
     * Get all active currencies for dropdowns/selects
     */
    public function getActive()
    {
        $currencies = Currency::active()
            ->ordered()
            ->get()
            ->map(function ($currency) {
                return [
                    'value' => $currency->code,
                    'label' => "{$currency->name} ({$currency->code})",
                    'symbol' => $currency->symbol,
                    'exchange_rate' => $currency->exchange_rate,
                    'country' => $currency->country
                ];
            });

        return response()->json($currencies);
    }

    /**
     * Get all currencies (active and inactive)
     */
    public function getAll()
    {
        $currencies = Currency::ordered()
            ->get()
            ->map(function ($currency) {
                return [
                    'value' => $currency->code,
                    'label' => "{$currency->name} ({$currency->code})",
                    'symbol' => $currency->symbol,
                    'exchange_rate' => $currency->exchange_rate,
                    'country' => $currency->country,
                    'is_active' => $currency->is_active,
                    'is_base_currency' => $currency->is_base_currency
                ];
            });

        return response()->json($currencies);
    }

    /**
     * Show the form for creating a new currency.
     */
    public function create()
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        return Inertia::render('system/Currencies/Create');
    }

    /**
     * Store a newly created currency in storage.
     */
    public function store(Request $request)
    {
        // Check if user has permission to can_add
        $this->requirePermission($request, null, 'can_add');
        $validated = $request->validate([
            'code' => 'required|string|max:3|unique:currencies,code',
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'country' => 'required|string|max:255',
            'exchange_rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'is_base_currency' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        // If this currency is set as base currency, unset others
        if ($validated['is_base_currency'] ?? false) {
            Currency::where('is_base_currency', true)->update(['is_base_currency' => false]);
        }

        $currency = Currency::create($validated);

        return redirect()->route('currencies.index')
            ->with('success', 'Currency created successfully.');
    }

    /**
     * Display the specified currency.
     */
    public function show(Currency $currency)
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        return Inertia::render('system/Currencies/Show', [
            'currency' => $currency
        ]);
    }

    /**
     * Show the form for editing the specified currency.
     */
    public function edit(Request $request, Currency $currency)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        return Inertia::render('system/Currencies/Edit', [
            'currency' => $currency
        ]);
    }

    /**
     * Update the specified currency in storage.
     */
    public function update(Request $request, Currency $currency)
    {
        // Check if user has permission to can_edit
        $this->requirePermission($request, null, 'can_edit');
        $validated = $request->validate([
            'code' => 'required|string|max:3|unique:currencies,code,' . $currency->id,
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'country' => 'required|string|max:255',
            'exchange_rate' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'is_base_currency' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        // If this currency is set as base currency, unset others
        if ($validated['is_base_currency'] ?? false) {
            Currency::where('is_base_currency', true)
                ->where('id', '!=', $currency->id)
                ->update(['is_base_currency' => false]);
        }

        $currency->update($validated);

        return redirect()->route('currencies.index')
            ->with('success', 'Currency updated successfully.');
    }

    /**
     * Remove the specified currency from storage.
     */
    public function destroy(Currency $currency)
    {
        // Check if user has permission to can_delete
        $this->requirePermission($request, null, 'can_delete');
        // Prevent deletion of base currency
        if ($currency->is_base_currency) {
            return back()->with('error', 'Cannot delete base currency.');
        }

        $currency->delete();

        return redirect()->route('currencies.index')
            ->with('success', 'Currency deleted successfully.');
    }

    /**
     * Toggle currency active status
     */
    public function toggleStatus(Currency $currency)
    {
        // Prevent deactivation of base currency
        if ($currency->is_base_currency && $currency->is_active) {
            return back()->with('error', 'Cannot deactivate base currency.');
        }

        $currency->is_active = !$currency->is_active;
        $currency->save();

        return back()->with('success', 'Currency status updated successfully.');
    }

    /**
     * Set currency as base currency
     */
    public function setAsBase(Currency $currency)
    {
        // Unset all other base currencies
        Currency::where('is_base_currency', true)->update(['is_base_currency' => false]);

        // Set this currency as base
        $currency->is_base_currency = true;
        $currency->exchange_rate = 1.0000;
        $currency->is_active = true;
        $currency->save();

        return back()->with('success', 'Base currency updated successfully.');
    }

    /**
     * Bulk update exchange rates
     */
    public function bulkUpdateRates(Request $request)
    {
        $validated = $request->validate([
            'rates' => 'required|array',
            'rates.*.id' => 'required|exists:currencies,id',
            'rates.*.exchange_rate' => 'required|numeric|min:0'
        ]);

        foreach ($validated['rates'] as $rate) {
            Currency::where('id', $rate['id'])->update([
                'exchange_rate' => $rate['exchange_rate']
            ]);
        }

        return back()->with('success', 'Exchange rates updated successfully.');
    }

    /**
     * Update exchange rates from API
     */
    public function updateFromApi(Request $request, ExchangeRateService $service)
    {
        $provider = $request->input('provider', 'frankfurter');
        $force = $request->boolean('force', false);

        $result = $service->updateAllCurrencyRates($provider, $force);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        } else {
            return back()->with('error', $result['message']);
        }
    }

    /**
     * Show currency converter calculator
     */
    public function converter()
    {
        $currencies = Currency::active()->ordered()->get();

        return Inertia::render('system/Currencies/Converter', [
            'currencies' => $currencies
        ]);
    }

    /**
     * Convert currency via API
     */
    public function convertCurrency(Request $request, ExchangeRateService $service)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'from' => 'required|exists:currencies,code',
            'to' => 'required|exists:currencies,code'
        ]);

        $result = $service->convert(
            $validated['amount'],
            $validated['from'],
            $validated['to']
        );

        return response()->json($result);
    }

    /**
     * Show currency history
     */
    public function history(Currency $currency)
    {
        $history = CurrencyExchangeRateHistory::forCurrency($currency->id)
            ->latest('effective_date')
            ->paginate(50);

        return Inertia::render('system/Currencies/History', [
            'currency' => $currency,
            'history' => $history
        ]);
    }

    /**
     * Get currency history data for charts
     */
    public function getHistoryData(Currency $currency, Request $request)
    {
        $days = $request->input('days', 30);
        
        $service = app(ExchangeRateService::class);
        $history = $service->getCurrencyHistory($currency->id, $days);

        return response()->json([
            'currency' => $currency,
            'history' => $history->map(function ($item) {
                return [
                    'date' => $item->effective_date->format('Y-m-d'),
                    'rate' => (float) $item->exchange_rate,
                    'change' => (float) $item->rate_change,
                    'source' => $item->source
                ];
            })
        ]);
    }
}

