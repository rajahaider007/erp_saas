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
        'fixer' => 'https://api.fixer.io/latest',
        'currencylayer' => 'http://api.currencylayer.com/live',
        'exchangerate-host' => 'https://api.exchangerate.host/latest',
        'ecb' => 'https://api.exchangerate-api.com/v4/latest/',
    ];

    /**
     * Get exchange rates from free API with fallback
     */
    public function fetchExchangeRates($baseCurrency = 'USD', $provider = 'auto')
    {
        // Try multiple APIs in order of reliability
        $providers = $provider === 'auto' ? 
            ['exchangerate-api', 'frankfurter', 'exchangerate-host'] : 
            [$provider];

        foreach ($providers as $currentProvider) {
            try {
                $url = $this->getApiUrl($currentProvider, $baseCurrency);
                
                Log::info("Fetching exchange rates from {$currentProvider}", ['url' => $url]);
                
                $response = Http::timeout(15)->get($url);
                
                if ($response->successful()) {
                    $data = $response->json();
                    $parsedData = $this->parseApiResponse($data, $currentProvider);
                    
                    if ($parsedData && !empty($parsedData['rates'])) {
                        Log::info("Successfully fetched rates from {$currentProvider}", [
                            'rates_count' => count($parsedData['rates']),
                            'base' => $parsedData['base']
                        ]);
                        return $parsedData;
                    }
                }
                
                Log::warning("Failed to fetch from {$currentProvider}", [
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 200)
                ]);
                
            } catch (\Exception $e) {
                Log::error("Error fetching from {$currentProvider}: " . $e->getMessage());
                continue;
            }
        }
        
        Log::error("All exchange rate APIs failed");
        return null;
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
            
            case 'exchangerate-host':
                return $this->freeApiProviders['exchangerate-host'] . '?base=' . $baseCurrency;
            
            case 'fixer':
                return $this->freeApiProviders['fixer'] . '?base=' . $baseCurrency;
            
            case 'currencylayer':
                return $this->freeApiProviders['currencylayer'] . '?access_key=free&currencies=';
            
            default:
                return $this->freeApiProviders['exchangerate-host'] . '?base=' . $baseCurrency;
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
            
            case 'exchangerate-host':
                return [
                    'base' => $data['base'] ?? 'USD',
                    'date' => $data['date'] ?? now()->toDateString(),
                    'rates' => $data['rates'] ?? []
                ];
            
            case 'fixer':
                return [
                    'base' => $data['base'] ?? 'USD',
                    'date' => $data['date'] ?? now()->toDateString(),
                    'rates' => $data['rates'] ?? []
                ];
            
            case 'currencylayer':
                return [
                    'base' => $data['source'] ?? 'USD',
                    'date' => $data['timestamp'] ? date('Y-m-d', $data['timestamp']) : now()->toDateString(),
                    'rates' => $data['quotes'] ?? []
                ];
            
            default:
                return null;
        }
    }

    /**
     * Update all currency exchange rates from API
     */
    public function updateAllCurrencyRates($provider = 'auto', $forceUpdate = false)
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
                'id' => 'auto',
                'name' => 'Auto (Best Available)',
                'description' => 'Automatically tries multiple APIs for best accuracy',
                'url' => 'https://exchangerate.host/'
            ],
            [
                'id' => 'exchangerate-host',
                'name' => 'ExchangeRate-Host',
                'description' => 'Free, real-time rates, no API key required',
                'url' => 'https://exchangerate.host/'
            ],
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

