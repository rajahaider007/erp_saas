<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currencies = [
            // Major World Currencies
            ['code' => 'USD', 'name' => 'United States Dollar', 'symbol' => '$', 'country' => 'United States', 'exchange_rate' => 1.0000, 'is_active' => true, 'is_base_currency' => true, 'sort_order' => 1],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'country' => 'European Union', 'exchange_rate' => 0.8500, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 2],
            ['code' => 'GBP', 'name' => 'British Pound Sterling', 'symbol' => '£', 'country' => 'United Kingdom', 'exchange_rate' => 0.7800, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 3],
            ['code' => 'JPY', 'name' => 'Japanese Yen', 'symbol' => '¥', 'country' => 'Japan', 'exchange_rate' => 110.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 4],
            ['code' => 'CHF', 'name' => 'Swiss Franc', 'symbol' => 'CHF', 'country' => 'Switzerland', 'exchange_rate' => 0.9200, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 5],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'symbol' => 'C$', 'country' => 'Canada', 'exchange_rate' => 1.2500, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 6],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'symbol' => 'A$', 'country' => 'Australia', 'exchange_rate' => 1.3500, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 7],
            ['code' => 'NZD', 'name' => 'New Zealand Dollar', 'symbol' => 'NZ$', 'country' => 'New Zealand', 'exchange_rate' => 1.4000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 8],
            
            // Asian Currencies
            ['code' => 'CNY', 'name' => 'Chinese Yuan', 'symbol' => '¥', 'country' => 'China', 'exchange_rate' => 6.4500, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 9],
            ['code' => 'HKD', 'name' => 'Hong Kong Dollar', 'symbol' => 'HK$', 'country' => 'Hong Kong', 'exchange_rate' => 7.8000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 10],
            ['code' => 'SGD', 'name' => 'Singapore Dollar', 'symbol' => 'S$', 'country' => 'Singapore', 'exchange_rate' => 1.3500, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 11],
            ['code' => 'KRW', 'name' => 'South Korean Won', 'symbol' => '₩', 'country' => 'South Korea', 'exchange_rate' => 1180.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 12],
            ['code' => 'INR', 'name' => 'Indian Rupee', 'symbol' => '₹', 'country' => 'India', 'exchange_rate' => 74.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 13],
            ['code' => 'PKR', 'name' => 'Pakistani Rupee', 'symbol' => '₨', 'country' => 'Pakistan', 'exchange_rate' => 160.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 14],
            ['code' => 'BDT', 'name' => 'Bangladeshi Taka', 'symbol' => '৳', 'country' => 'Bangladesh', 'exchange_rate' => 85.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 15],
            ['code' => 'LKR', 'name' => 'Sri Lankan Rupee', 'symbol' => '₨', 'country' => 'Sri Lanka', 'exchange_rate' => 200.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 16],
            ['code' => 'NPR', 'name' => 'Nepalese Rupee', 'symbol' => '₨', 'country' => 'Nepal', 'exchange_rate' => 118.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 17],
            ['code' => 'THB', 'name' => 'Thai Baht', 'symbol' => '฿', 'country' => 'Thailand', 'exchange_rate' => 33.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 18],
            ['code' => 'MYR', 'name' => 'Malaysian Ringgit', 'symbol' => 'RM', 'country' => 'Malaysia', 'exchange_rate' => 4.2000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 19],
            ['code' => 'IDR', 'name' => 'Indonesian Rupiah', 'symbol' => 'Rp', 'country' => 'Indonesia', 'exchange_rate' => 14400.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 20],
            ['code' => 'PHP', 'name' => 'Philippine Peso', 'symbol' => '₱', 'country' => 'Philippines', 'exchange_rate' => 50.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 21],
            ['code' => 'VND', 'name' => 'Vietnamese Dong', 'symbol' => '₫', 'country' => 'Vietnam', 'exchange_rate' => 23000.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 22],
            
            // Middle East & Africa
            ['code' => 'AED', 'name' => 'UAE Dirham', 'symbol' => 'د.إ', 'country' => 'United Arab Emirates', 'exchange_rate' => 3.6700, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 23],
            ['code' => 'SAR', 'name' => 'Saudi Riyal', 'symbol' => '﷼', 'country' => 'Saudi Arabia', 'exchange_rate' => 3.7500, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 24],
            ['code' => 'QAR', 'name' => 'Qatari Riyal', 'symbol' => '﷼', 'country' => 'Qatar', 'exchange_rate' => 3.6400, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 25],
            ['code' => 'KWD', 'name' => 'Kuwaiti Dinar', 'symbol' => 'د.ك', 'country' => 'Kuwait', 'exchange_rate' => 0.3000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 26],
            ['code' => 'BHD', 'name' => 'Bahraini Dinar', 'symbol' => 'د.ب', 'country' => 'Bahrain', 'exchange_rate' => 0.3800, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 27],
            ['code' => 'OMR', 'name' => 'Omani Rial', 'symbol' => '﷼', 'country' => 'Oman', 'exchange_rate' => 0.3800, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 28],
            ['code' => 'JOD', 'name' => 'Jordanian Dinar', 'symbol' => 'د.ا', 'country' => 'Jordan', 'exchange_rate' => 0.7100, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 29],
            ['code' => 'LBP', 'name' => 'Lebanese Pound', 'symbol' => 'ل.ل', 'country' => 'Lebanon', 'exchange_rate' => 1500.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 30],
            ['code' => 'EGP', 'name' => 'Egyptian Pound', 'symbol' => '£', 'country' => 'Egypt', 'exchange_rate' => 15.7000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 31],
            ['code' => 'ZAR', 'name' => 'South African Rand', 'symbol' => 'R', 'country' => 'South Africa', 'exchange_rate' => 14.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 32],
            ['code' => 'NGN', 'name' => 'Nigerian Naira', 'symbol' => '₦', 'country' => 'Nigeria', 'exchange_rate' => 410.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 33],
            ['code' => 'KES', 'name' => 'Kenyan Shilling', 'symbol' => 'KSh', 'country' => 'Kenya', 'exchange_rate' => 110.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 34],
            ['code' => 'GHS', 'name' => 'Ghanaian Cedi', 'symbol' => '₵', 'country' => 'Ghana', 'exchange_rate' => 6.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 35],
            
            // European Currencies
            ['code' => 'SEK', 'name' => 'Swedish Krona', 'symbol' => 'kr', 'country' => 'Sweden', 'exchange_rate' => 8.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 36],
            ['code' => 'NOK', 'name' => 'Norwegian Krone', 'symbol' => 'kr', 'country' => 'Norway', 'exchange_rate' => 8.8000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 37],
            ['code' => 'DKK', 'name' => 'Danish Krone', 'symbol' => 'kr', 'country' => 'Denmark', 'exchange_rate' => 6.3000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 38],
            ['code' => 'PLN', 'name' => 'Polish Zloty', 'symbol' => 'zł', 'country' => 'Poland', 'exchange_rate' => 3.9000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 39],
            ['code' => 'CZK', 'name' => 'Czech Koruna', 'symbol' => 'Kč', 'country' => 'Czech Republic', 'exchange_rate' => 21.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 40],
            ['code' => 'HUF', 'name' => 'Hungarian Forint', 'symbol' => 'Ft', 'country' => 'Hungary', 'exchange_rate' => 300.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 41],
            ['code' => 'RON', 'name' => 'Romanian Leu', 'symbol' => 'lei', 'country' => 'Romania', 'exchange_rate' => 4.2000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 42],
            ['code' => 'BGN', 'name' => 'Bulgarian Lev', 'symbol' => 'лв', 'country' => 'Bulgaria', 'exchange_rate' => 1.6600, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 43],
            ['code' => 'HRK', 'name' => 'Croatian Kuna', 'symbol' => 'kn', 'country' => 'Croatia', 'exchange_rate' => 6.4000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 44],
            ['code' => 'RSD', 'name' => 'Serbian Dinar', 'symbol' => 'дин', 'country' => 'Serbia', 'exchange_rate' => 100.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 45],
            
            // Latin American Currencies
            ['code' => 'BRL', 'name' => 'Brazilian Real', 'symbol' => 'R$', 'country' => 'Brazil', 'exchange_rate' => 5.2000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 46],
            ['code' => 'MXN', 'name' => 'Mexican Peso', 'symbol' => '$', 'country' => 'Mexico', 'exchange_rate' => 20.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 47],
            ['code' => 'ARS', 'name' => 'Argentine Peso', 'symbol' => '$', 'country' => 'Argentina', 'exchange_rate' => 100.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 48],
            ['code' => 'CLP', 'name' => 'Chilean Peso', 'symbol' => '$', 'country' => 'Chile', 'exchange_rate' => 800.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 49],
            ['code' => 'COP', 'name' => 'Colombian Peso', 'symbol' => '$', 'country' => 'Colombia', 'exchange_rate' => 3800.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 50],
            ['code' => 'PEN', 'name' => 'Peruvian Sol', 'symbol' => 'S/', 'country' => 'Peru', 'exchange_rate' => 3.7000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 51],
            ['code' => 'UYU', 'name' => 'Uruguayan Peso', 'symbol' => '$U', 'country' => 'Uruguay', 'exchange_rate' => 44.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 52],
            ['code' => 'BOB', 'name' => 'Bolivian Boliviano', 'symbol' => 'Bs', 'country' => 'Bolivia', 'exchange_rate' => 6.9000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 53],
            ['code' => 'VES', 'name' => 'Venezuelan Bolívar', 'symbol' => 'Bs.S', 'country' => 'Venezuela', 'exchange_rate' => 4000000.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 54],
            
            // Other Major Currencies
            ['code' => 'RUB', 'name' => 'Russian Ruble', 'symbol' => '₽', 'country' => 'Russia', 'exchange_rate' => 75.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 55],
            ['code' => 'TRY', 'name' => 'Turkish Lira', 'symbol' => '₺', 'country' => 'Turkey', 'exchange_rate' => 8.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 56],
            ['code' => 'ILS', 'name' => 'Israeli Shekel', 'symbol' => '₪', 'country' => 'Israel', 'exchange_rate' => 3.2000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 57],
            ['code' => 'UAH', 'name' => 'Ukrainian Hryvnia', 'symbol' => '₴', 'country' => 'Ukraine', 'exchange_rate' => 27.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 58],
            ['code' => 'BYN', 'name' => 'Belarusian Ruble', 'symbol' => 'Br', 'country' => 'Belarus', 'exchange_rate' => 2.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 59],
            ['code' => 'KZT', 'name' => 'Kazakhstani Tenge', 'symbol' => '₸', 'country' => 'Kazakhstan', 'exchange_rate' => 425.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 60],
            ['code' => 'UZS', 'name' => 'Uzbekistani Som', 'symbol' => 'лв', 'country' => 'Uzbekistan', 'exchange_rate' => 10700.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 61],
            ['code' => 'KGS', 'name' => 'Kyrgyzstani Som', 'symbol' => 'лв', 'country' => 'Kyrgyzstan', 'exchange_rate' => 84.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 62],
            ['code' => 'TJS', 'name' => 'Tajikistani Somoni', 'symbol' => 'SM', 'country' => 'Tajikistan', 'exchange_rate' => 11.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 63],
            ['code' => 'TMT', 'name' => 'Turkmenistani Manat', 'symbol' => 'T', 'country' => 'Turkmenistan', 'exchange_rate' => 3.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 64],
            ['code' => 'AFN', 'name' => 'Afghan Afghani', 'symbol' => '؋', 'country' => 'Afghanistan', 'exchange_rate' => 80.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 65],
            ['code' => 'IRR', 'name' => 'Iranian Rial', 'symbol' => '﷼', 'country' => 'Iran', 'exchange_rate' => 42000.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 66],
            ['code' => 'IQD', 'name' => 'Iraqi Dinar', 'symbol' => 'ع.د', 'country' => 'Iraq', 'exchange_rate' => 1460.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 67],
            ['code' => 'SYP', 'name' => 'Syrian Pound', 'symbol' => '£', 'country' => 'Syria', 'exchange_rate' => 2500.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 68],
            ['code' => 'YER', 'name' => 'Yemeni Rial', 'symbol' => '﷼', 'country' => 'Yemen', 'exchange_rate' => 250.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 69],
            ['code' => 'SOS', 'name' => 'Somali Shilling', 'symbol' => 'S', 'country' => 'Somalia', 'exchange_rate' => 580.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 70],
            ['code' => 'ETB', 'name' => 'Ethiopian Birr', 'symbol' => 'Br', 'country' => 'Ethiopia', 'exchange_rate' => 45.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 71],
            ['code' => 'TZS', 'name' => 'Tanzanian Shilling', 'symbol' => 'TSh', 'country' => 'Tanzania', 'exchange_rate' => 2300.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 72],
            ['code' => 'UGX', 'name' => 'Ugandan Shilling', 'symbol' => 'USh', 'country' => 'Uganda', 'exchange_rate' => 3500.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 73],
            ['code' => 'RWF', 'name' => 'Rwandan Franc', 'symbol' => 'RF', 'country' => 'Rwanda', 'exchange_rate' => 1000.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 74],
            ['code' => 'BIF', 'name' => 'Burundian Franc', 'symbol' => 'FBu', 'country' => 'Burundi', 'exchange_rate' => 2000.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 75],
            ['code' => 'MWK', 'name' => 'Malawian Kwacha', 'symbol' => 'MK', 'country' => 'Malawi', 'exchange_rate' => 800.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 76],
            ['code' => 'ZMW', 'name' => 'Zambian Kwacha', 'symbol' => 'ZK', 'country' => 'Zambia', 'exchange_rate' => 18.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 77],
            ['code' => 'BWP', 'name' => 'Botswana Pula', 'symbol' => 'P', 'country' => 'Botswana', 'exchange_rate' => 11.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 78],
            ['code' => 'NAD', 'name' => 'Namibian Dollar', 'symbol' => 'N$', 'country' => 'Namibia', 'exchange_rate' => 14.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 79],
            ['code' => 'SZL', 'name' => 'Swazi Lilangeni', 'symbol' => 'L', 'country' => 'Eswatini', 'exchange_rate' => 14.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 80],
            ['code' => 'LSL', 'name' => 'Lesotho Loti', 'symbol' => 'L', 'country' => 'Lesotho', 'exchange_rate' => 14.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 81],
            ['code' => 'MUR', 'name' => 'Mauritian Rupee', 'symbol' => '₨', 'country' => 'Mauritius', 'exchange_rate' => 40.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 82],
            ['code' => 'SCR', 'name' => 'Seychellois Rupee', 'symbol' => '₨', 'country' => 'Seychelles', 'exchange_rate' => 13.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 83],
            ['code' => 'MAD', 'name' => 'Moroccan Dirham', 'symbol' => 'د.م.', 'country' => 'Morocco', 'exchange_rate' => 9.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 84],
            ['code' => 'TND', 'name' => 'Tunisian Dinar', 'symbol' => 'د.ت', 'country' => 'Tunisia', 'exchange_rate' => 2.8000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 85],
            ['code' => 'DZD', 'name' => 'Algerian Dinar', 'symbol' => 'د.ج', 'country' => 'Algeria', 'exchange_rate' => 135.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 86],
            ['code' => 'LYD', 'name' => 'Libyan Dinar', 'symbol' => 'ل.د', 'country' => 'Libya', 'exchange_rate' => 4.5000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 87],
            ['code' => 'SDG', 'name' => 'Sudanese Pound', 'symbol' => 'ج.س.', 'country' => 'Sudan', 'exchange_rate' => 55.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 88],
            ['code' => 'SSP', 'name' => 'South Sudanese Pound', 'symbol' => '£', 'country' => 'South Sudan', 'exchange_rate' => 300.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 89],
            ['code' => 'CDF', 'name' => 'Congolese Franc', 'symbol' => 'FC', 'country' => 'Democratic Republic of Congo', 'exchange_rate' => 2000.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 90],
            ['code' => 'XAF', 'name' => 'Central African CFA Franc', 'symbol' => 'FCFA', 'country' => 'Central African Republic', 'exchange_rate' => 550.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 91],
            ['code' => 'XOF', 'name' => 'West African CFA Franc', 'symbol' => 'CFA', 'country' => 'Senegal', 'exchange_rate' => 550.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 92],
            ['code' => 'GMD', 'name' => 'Gambian Dalasi', 'symbol' => 'D', 'country' => 'Gambia', 'exchange_rate' => 52.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 93],
            ['code' => 'GNF', 'name' => 'Guinean Franc', 'symbol' => 'FG', 'country' => 'Guinea', 'exchange_rate' => 10200.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 94],
            ['code' => 'SLL', 'name' => 'Sierra Leonean Leone', 'symbol' => 'Le', 'country' => 'Sierra Leone', 'exchange_rate' => 10200.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 95],
            ['code' => 'LRD', 'name' => 'Liberian Dollar', 'symbol' => 'L$', 'country' => 'Liberia', 'exchange_rate' => 160.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 96],
            ['code' => 'CVE', 'name' => 'Cape Verdean Escudo', 'symbol' => '$', 'country' => 'Cape Verde', 'exchange_rate' => 100.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 97],
            ['code' => 'STN', 'name' => 'São Tomé and Príncipe Dobra', 'symbol' => 'Db', 'country' => 'São Tomé and Príncipe', 'exchange_rate' => 22.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 98],
            ['code' => 'AOA', 'name' => 'Angolan Kwanza', 'symbol' => 'Kz', 'country' => 'Angola', 'exchange_rate' => 650.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 99],
            ['code' => 'ZWL', 'name' => 'Zimbabwean Dollar', 'symbol' => 'Z$', 'country' => 'Zimbabwe', 'exchange_rate' => 4000000.0000, 'is_active' => true, 'is_base_currency' => false, 'sort_order' => 100],
        ];
        
        foreach ($currencies as $currency) {
            \DB::table('currencies')->updateOrInsert(
                ['code' => $currency['code']],
                array_merge($currency, [
                    'created_at' => now(),
                    'updated_at' => now()
                ])
            );
        }
    }
}
