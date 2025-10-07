<?php

namespace App\Services;

use App\Models\Currency;
use App\Models\CurrencyExchangeRateHistory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ExchangeRateService
{
    /**
     * Free Exchange Rate APIs (no API key required)
     */
    private $freeApiProviders = [
        'exchangerate-api' => 'https://api.exchangerate-api.com/v4/latest/',
        'frankfurter' => 'https://api.frankfurter.app/latest',
    ];

    /**
     * Get exchange rates from free API
     */
    public function fetchExchangeRates($baseCurrency = 'USD', $provider = 'frankfurter')
    {
        try {
            $url = $this->getApiUrl($provider, $baseCurrency);
            
            Log::info("Fetching exchange rates from {$provider}", ['url' => $url]);
            
            $response = Http::timeout(10)->get($url);
            
            if (!$response->successful()) {
                Log::error("Failed to fetch exchange rates from {$provider}", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $data = $response->json();
            
            return $this->parseApiResponse($data, $provider);
            
        } catch (\Exception $e) {
            Log::error("Error fetching exchange rates: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get API URL for provider
     */
    private function getApiUrl($provider, $baseCurrency)
    {
        switch ($provider) {
            case 'exchangerate-api':
                return $this->freeApiProviders['exchangerate-api'] . $baseCurrency;
            
            case 'frankfurter':
                return $this->freeApiProviders['frankfurter'] . '?from=' . $baseCurrency;
            
            default:
                return $this->freeApiProviders['frankfurter'] . '?from=' . $baseCurrency;
        }
    }

    /**
     * Parse API response based on provider
     */
    private function parseApiResponse($data, $provider)
    {
        switch ($provider) {
            case 'exchangerate-api':
                return [
                    'base' => $data['base'] ?? 'USD',
                    'date' => $data['date'] ?? now()->toDateString(),
                    'rates' => $data['rates'] ?? []
                ];
            
            case 'frankfurter':
                return [
                    'base' => $data['base'] ?? 'USD',
                    'date' => $data['date'] ?? now()->toDateString(),
                    'rates' => $data['rates'] ?? []
                ];
            
            default:
                return null;
        }
    }

    /**
     * Update all currency exchange rates from API
     */
    public function updateAllCurrencyRates($provider = 'frankfurter', $forceUpdate = false)
    {
        try {
            // Get base currency
            $baseCurrency = Currency::base()->first();
            
            if (!$baseCurrency) {
                Log::error("No base currency found");
                return [
                    'success' => false,
                    'message' => 'No base currency configured',
                    'updated' => 0
                ];
            }

            // Check cache to avoid too frequent updates
            $cacheKey = "exchange_rates_last_update";
            $lastUpdate = Cache::get($cacheKey);
            
            if (!$forceUpdate && $lastUpdate && now()->diffInMinutes($lastUpdate) < 60) {
                return [
                    'success' => false,
                    'message' => 'Exchange rates were updated recently. Try again later.',
                    'updated' => 0,
                    'last_update' => $lastUpdate
                ];
            }

            // Fetch exchange rates from API
            $exchangeData = $this->fetchExchangeRates($baseCurrency->code, $provider);
            
            if (!$exchangeData || empty($exchangeData['rates'])) {
                Log::error("Failed to fetch exchange rates or no rates returned");
                return [
                    'success' => false,
                    'message' => 'Failed to fetch exchange rates from API',
                    'updated' => 0
                ];
            }

            $updatedCount = 0;
            $errors = [];

            // Update each currency
            foreach ($exchangeData['rates'] as $currencyCode => $rate) {
                try {
                    $currency = Currency::where('code', $currencyCode)->first();
                    
                    if ($currency && !$currency->is_base_currency) {
                        // Log the rate change
                        $currency->logRateChange(
                            $rate,
                            'api',
                            $provider,
                            "Automatically updated from {$provider} API"
                        );
                        
                        // Update the currency rate
                        $currency->exchange_rate = $rate;
                        $currency->save();
                        
                        $updatedCount++;
                    }
                } catch (\Exception $e) {
                    $errors[] = "Failed to update {$currencyCode}: " . $e->getMessage();
                    Log::error("Error updating currency {$currencyCode}", ['error' => $e->getMessage()]);
                }
            }

            // Update cache
            Cache::put($cacheKey, now(), now()->addHours(1));

            // Clear currencies cache
            Cache::forget('active_currencies');

            Log::info("Exchange rates updated successfully", [
                'provider' => $provider,
                'updated_count' => $updatedCount,
                'errors_count' => count($errors)
            ]);

            return [
                'success' => true,
                'message' => "Successfully updated {$updatedCount} currency exchange rates",
                'updated' => $updatedCount,
                'errors' => $errors,
                'provider' => $provider,
                'date' => $exchangeData['date']
            ];

        } catch (\Exception $e) {
            Log::error("Error in updateAllCurrencyRates: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An error occurred while updating exchange rates',
                'updated' => 0,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get exchange rate history for a currency
     */
    public function getCurrencyHistory($currencyId, $days = 30)
    {
        return CurrencyExchangeRateHistory::forCurrency($currencyId)
            ->betweenDates(now()->subDays($days), now())
            ->orderBy('effective_date', 'asc')
            ->get();
    }

    /**
     * Convert amount between currencies
     */
    public function convert($amount, $fromCurrencyCode, $toCurrencyCode)
    {
        try {
            $fromCurrency = Currency::where('code', $fromCurrencyCode)->first();
            $toCurrency = Currency::where('code', $toCurrencyCode)->first();

            if (!$fromCurrency || !$toCurrency) {
                return null;
            }

            // Convert from source to base currency
            $baseAmount = $fromCurrency->convertToBase($amount);
            
            // Convert from base to target currency
            $convertedAmount = $toCurrency->convertFromBase($baseAmount);

            return [
                'from_currency' => $fromCurrency->code,
                'to_currency' => $toCurrency->code,
                'from_amount' => $amount,
                'to_amount' => round($convertedAmount, 2),
                'exchange_rate' => round($toCurrency->exchange_rate / $fromCurrency->exchange_rate, 6),
                'from_symbol' => $fromCurrency->symbol,
                'to_symbol' => $toCurrency->symbol
            ];
        } catch (\Exception $e) {
            Log::error("Currency conversion error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get supported API providers
     */
    public function getSupportedProviders()
    {
        return [
            [
                'id' => 'frankfurter',
                'name' => 'Frankfurter API',
                'description' => 'Free, no API key required, European Central Bank data',
                'url' => 'https://www.frankfurter.app/'
            ],
            [
                'id' => 'exchangerate-api',
                'name' => 'ExchangeRate-API',
                'description' => 'Free tier available, 1,500 requests/month',
                'url' => 'https://www.exchangerate-api.com/'
            ]
        ];
    }
}

