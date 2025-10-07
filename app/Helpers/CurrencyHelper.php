<?php

namespace App\Helpers;

use App\Models\Currency;
use App\Services\ExchangeRateService;

class CurrencyHelper
{
    /**
     * Convert amount from one currency to another
     */
    public static function convert($amount, $fromCurrency, $toCurrency)
    {
        $exchangeRateService = app(ExchangeRateService::class);
        return $exchangeRateService->convert($amount, $fromCurrency, $toCurrency);
    }

    /**
     * Format amount with currency symbol
     */
    public static function format($amount, $currencyCode, $showCode = true)
    {
        $currency = Currency::where('code', $currencyCode)->first();
        
        if (!$currency) {
            return number_format($amount, 2);
        }

        $formatted = $currency->symbol . ' ' . number_format($amount, 2);
        
        if ($showCode) {
            $formatted .= ' ' . $currency->code;
        }

        return $formatted;
    }

    /**
     * Get currency symbol
     */
    public static function getSymbol($currencyCode)
    {
        $currency = Currency::where('code', $currencyCode)->first();
        return $currency ? $currency->symbol : '';
    }

    /**
     * Get all active currencies
     */
    public static function getActiveCurrencies()
    {
        return Currency::active()->ordered()->get();
    }

    /**
     * Get base currency
     */
    public static function getBaseCurrency()
    {
        return Currency::base()->first();
    }

    /**
     * Convert to base currency
     */
    public static function toBaseCurrency($amount, $fromCurrency)
    {
        $currency = Currency::where('code', $fromCurrency)->first();
        
        if (!$currency) {
            return $amount;
        }

        return $currency->convertToBase($amount);
    }

    /**
     * Convert from base currency
     */
    public static function fromBaseCurrency($amount, $toCurrency)
    {
        $currency = Currency::where('code', $toCurrency)->first();
        
        if (!$currency) {
            return $amount;
        }

        return $currency->convertFromBase($amount);
    }

    /**
     * Get exchange rate between two currencies
     */
    public static function getExchangeRate($fromCurrency, $toCurrency)
    {
        $from = Currency::where('code', $fromCurrency)->first();
        $to = Currency::where('code', $toCurrency)->first();

        if (!$from || !$to) {
            return 1;
        }

        // Convert to base, then to target
        return $to->exchange_rate / $from->exchange_rate;
    }

    /**
     * Format multiple amounts with different currencies
     */
    public static function formatMultiple(array $amounts)
    {
        $formatted = [];
        
        foreach ($amounts as $currencyCode => $amount) {
            $formatted[$currencyCode] = self::format($amount, $currencyCode);
        }

        return $formatted;
    }

    /**
     * Calculate total in base currency from multiple currency amounts
     */
    public static function calculateTotalInBase(array $amounts)
    {
        $total = 0;

        foreach ($amounts as $currencyCode => $amount) {
            $total += self::toBaseCurrency($amount, $currencyCode);
        }

        return $total;
    }

    /**
     * Get currency display name
     */
    public static function getDisplayName($currencyCode)
    {
        $currency = Currency::where('code', $currencyCode)->first();
        return $currency ? $currency->name : $currencyCode;
    }

    /**
     * Check if currency exists
     */
    public static function exists($currencyCode)
    {
        return Currency::where('code', $currencyCode)->exists();
    }

    /**
     * Get currency object
     */
    public static function getCurrency($currencyCode)
    {
        return Currency::where('code', $currencyCode)->first();
    }

    /**
     * Format amount with different precision
     */
    public static function formatWithPrecision($amount, $currencyCode, $precision = 2, $showCode = true)
    {
        $currency = Currency::where('code', $currencyCode)->first();
        
        if (!$currency) {
            return number_format($amount, $precision);
        }

        $formatted = $currency->symbol . ' ' . number_format($amount, $precision);
        
        if ($showCode) {
            $formatted .= ' ' . $currency->code;
        }

        return $formatted;
    }
}

