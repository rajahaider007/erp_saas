-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 05, 2025 at 08:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `erp`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `comp_id` bigint(20) UNSIGNED DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED DEFAULT NULL,
  `account_code` varchar(15) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_type` enum('Assets','Liabilities','Equity','Revenue','Expenses') NOT NULL,
  `account_subtype` varchar(255) DEFAULT NULL,
  `parent_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `account_level` tinyint(4) NOT NULL DEFAULT 1,
  `account_path` text DEFAULT NULL,
  `normal_balance` enum('Debit','Credit') NOT NULL,
  `opening_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(18,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `is_parent` tinyint(1) NOT NULL DEFAULT 0,
  `is_child` tinyint(1) NOT NULL DEFAULT 0,
  `is_transactional` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `tax_category` enum('Taxable','Non-taxable','Exempt') NOT NULL DEFAULT 'Taxable',
  `reporting_category` varchar(255) DEFAULT NULL,
  `cost_center` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `min_balance` decimal(18,2) DEFAULT NULL,
  `max_balance` decimal(18,2) DEFAULT NULL,
  `requires_approval` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `company_code` varchar(255) NOT NULL,
  `legal_name` varchar(255) DEFAULT NULL,
  `trading_name` varchar(255) DEFAULT NULL,
  `registration_number` varchar(255) NOT NULL,
  `tax_id` varchar(255) DEFAULT NULL,
  `vat_number` varchar(255) DEFAULT NULL,
  `incorporation_date` date DEFAULT NULL,
  `company_type` varchar(255) NOT NULL DEFAULT 'private_limited',
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `fax` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `address_line_1` text NOT NULL,
  `address_line_2` text DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'UTC',
  `industry` varchar(255) DEFAULT NULL,
  `business_description` text DEFAULT NULL,
  `employee_count` int(11) DEFAULT NULL,
  `annual_revenue` decimal(15,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `fiscal_year_start` varchar(10) NOT NULL DEFAULT '01-01',
  `license_number` varchar(255) DEFAULT NULL,
  `license_expiry` date DEFAULT NULL,
  `compliance_certifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`compliance_certifications`)),
  `legal_notes` text DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_account_number` varchar(255) DEFAULT NULL,
  `bank_routing_number` varchar(255) DEFAULT NULL,
  `swift_code` varchar(255) DEFAULT NULL,
  `iban` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `brand_color_primary` varchar(7) NOT NULL DEFAULT '#3B82F6',
  `brand_color_secondary` varchar(7) NOT NULL DEFAULT '#64748B',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `package_id` bigint(20) UNSIGNED DEFAULT NULL,
  `license_start_date` date DEFAULT NULL,
  `license_end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `company_name`, `company_code`, `legal_name`, `trading_name`, `registration_number`, `tax_id`, `vat_number`, `incorporation_date`, `company_type`, `email`, `phone`, `fax`, `website`, `address_line_1`, `address_line_2`, `city`, `state_province`, `postal_code`, `country`, `timezone`, `industry`, `business_description`, `employee_count`, `annual_revenue`, `currency`, `fiscal_year_start`, `license_number`, `license_expiry`, `compliance_certifications`, `legal_notes`, `bank_name`, `bank_account_number`, `bank_routing_number`, `swift_code`, `iban`, `logo`, `brand_color_primary`, `brand_color_secondary`, `status`, `settings`, `features`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `package_id`, `license_start_date`, `license_end_date`) VALUES
(11, 'Acme Corporation', 'ACME001', NULL, NULL, 'REG001', NULL, NULL, NULL, 'private_limited', 'contact@acme.com', NULL, NULL, NULL, '123 Main Street', NULL, 'New York', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-10-05 02:40:03', NULL, 3, '2025-10-01', '2026-10-01'),
(12, 'Tech Solutions Inc', 'TECH001', NULL, NULL, 'REG002', NULL, NULL, NULL, 'private_limited', 'info@techsolutions.com', NULL, NULL, NULL, '456 Tech Avenue', NULL, 'San Francisco', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(13, 'Global Industries Ltd', 'GLOBAL001', NULL, NULL, 'REG003', NULL, NULL, NULL, 'private_limited', 'contact@globalindustries.com', NULL, NULL, NULL, '789 Business District', NULL, 'London', NULL, NULL, 'United Kingdom', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(14, 'Innovation Hub', 'INNOV001', NULL, NULL, 'REG004', NULL, NULL, NULL, 'private_limited', 'hello@innovationhub.com', NULL, NULL, NULL, '321 Innovation Street', NULL, 'Boston', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(15, 'Enterprise Systems', 'ENT001', NULL, NULL, 'REG005', NULL, NULL, NULL, 'private_limited', 'contact@enterprisesystems.com', NULL, NULL, NULL, '654 Corporate Plaza', NULL, 'Chicago', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 0, NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(3) NOT NULL,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `exchange_rate` decimal(20,4) NOT NULL DEFAULT 1.0000,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_base_currency` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `code`, `name`, `symbol`, `country`, `exchange_rate`, `is_active`, `is_base_currency`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'USD', 'United States Dollar', '$', 'United States', 1.0000, 1, 1, 1, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(2, 'EUR', 'Euro', '€', 'European Union', 0.8500, 1, 0, 2, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(3, 'GBP', 'British Pound Sterling', '£', 'United Kingdom', 0.7800, 1, 0, 3, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(4, 'JPY', 'Japanese Yen', '¥', 'Japan', 110.0000, 1, 0, 4, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(5, 'CHF', 'Swiss Franc', 'CHF', 'Switzerland', 0.9200, 1, 0, 5, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(6, 'CAD', 'Canadian Dollar', 'C$', 'Canada', 1.2500, 1, 0, 6, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(7, 'AUD', 'Australian Dollar', 'A$', 'Australia', 1.3500, 1, 0, 7, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(8, 'NZD', 'New Zealand Dollar', 'NZ$', 'New Zealand', 1.4000, 1, 0, 8, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(9, 'CNY', 'Chinese Yuan', '¥', 'China', 6.4500, 1, 0, 9, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(10, 'HKD', 'Hong Kong Dollar', 'HK$', 'Hong Kong', 7.8000, 1, 0, 10, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(11, 'SGD', 'Singapore Dollar', 'S$', 'Singapore', 1.3500, 1, 0, 11, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(12, 'KRW', 'South Korean Won', '₩', 'South Korea', 1180.0000, 1, 0, 12, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(13, 'INR', 'Indian Rupee', '₹', 'India', 74.0000, 1, 0, 13, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(14, 'PKR', 'Pakistani Rupee', '₨', 'Pakistan', 160.0000, 1, 0, 14, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(15, 'BDT', 'Bangladeshi Taka', '৳', 'Bangladesh', 85.0000, 1, 0, 15, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(16, 'LKR', 'Sri Lankan Rupee', '₨', 'Sri Lanka', 200.0000, 1, 0, 16, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(17, 'NPR', 'Nepalese Rupee', '₨', 'Nepal', 118.0000, 1, 0, 17, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(18, 'THB', 'Thai Baht', '฿', 'Thailand', 33.0000, 1, 0, 18, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(19, 'MYR', 'Malaysian Ringgit', 'RM', 'Malaysia', 4.2000, 1, 0, 19, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(20, 'IDR', 'Indonesian Rupiah', 'Rp', 'Indonesia', 14400.0000, 1, 0, 20, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(21, 'PHP', 'Philippine Peso', '₱', 'Philippines', 50.0000, 1, 0, 21, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(22, 'VND', 'Vietnamese Dong', '₫', 'Vietnam', 23000.0000, 1, 0, 22, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(23, 'AED', 'UAE Dirham', 'د.إ', 'United Arab Emirates', 3.6700, 1, 0, 23, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(24, 'SAR', 'Saudi Riyal', '﷼', 'Saudi Arabia', 3.7500, 1, 0, 24, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(25, 'QAR', 'Qatari Riyal', '﷼', 'Qatar', 3.6400, 1, 0, 25, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(26, 'KWD', 'Kuwaiti Dinar', 'د.ك', 'Kuwait', 0.3000, 1, 0, 26, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(27, 'BHD', 'Bahraini Dinar', 'د.ب', 'Bahrain', 0.3800, 1, 0, 27, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(28, 'OMR', 'Omani Rial', '﷼', 'Oman', 0.3800, 1, 0, 28, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(29, 'JOD', 'Jordanian Dinar', 'د.ا', 'Jordan', 0.7100, 1, 0, 29, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(30, 'LBP', 'Lebanese Pound', 'ل.ل', 'Lebanon', 1500.0000, 1, 0, 30, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(31, 'EGP', 'Egyptian Pound', '£', 'Egypt', 15.7000, 1, 0, 31, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(32, 'ZAR', 'South African Rand', 'R', 'South Africa', 14.5000, 1, 0, 32, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(33, 'NGN', 'Nigerian Naira', '₦', 'Nigeria', 410.0000, 1, 0, 33, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(34, 'KES', 'Kenyan Shilling', 'KSh', 'Kenya', 110.0000, 1, 0, 34, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(35, 'GHS', 'Ghanaian Cedi', '₵', 'Ghana', 6.0000, 1, 0, 35, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(36, 'SEK', 'Swedish Krona', 'kr', 'Sweden', 8.5000, 1, 0, 36, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(37, 'NOK', 'Norwegian Krone', 'kr', 'Norway', 8.8000, 1, 0, 37, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(38, 'DKK', 'Danish Krone', 'kr', 'Denmark', 6.3000, 1, 0, 38, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(39, 'PLN', 'Polish Zloty', 'zł', 'Poland', 3.9000, 1, 0, 39, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(40, 'CZK', 'Czech Koruna', 'Kč', 'Czech Republic', 21.5000, 1, 0, 40, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(41, 'HUF', 'Hungarian Forint', 'Ft', 'Hungary', 300.0000, 1, 0, 41, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(42, 'RON', 'Romanian Leu', 'lei', 'Romania', 4.2000, 1, 0, 42, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(43, 'BGN', 'Bulgarian Lev', 'лв', 'Bulgaria', 1.6600, 1, 0, 43, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(44, 'HRK', 'Croatian Kuna', 'kn', 'Croatia', 6.4000, 1, 0, 44, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(45, 'RSD', 'Serbian Dinar', 'дин', 'Serbia', 100.0000, 1, 0, 45, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(46, 'BRL', 'Brazilian Real', 'R$', 'Brazil', 5.2000, 1, 0, 46, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(47, 'MXN', 'Mexican Peso', '$', 'Mexico', 20.0000, 1, 0, 47, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(48, 'ARS', 'Argentine Peso', '$', 'Argentina', 100.0000, 1, 0, 48, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(49, 'CLP', 'Chilean Peso', '$', 'Chile', 800.0000, 1, 0, 49, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(50, 'COP', 'Colombian Peso', '$', 'Colombia', 3800.0000, 1, 0, 50, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(51, 'PEN', 'Peruvian Sol', 'S/', 'Peru', 3.7000, 1, 0, 51, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(52, 'UYU', 'Uruguayan Peso', '$U', 'Uruguay', 44.0000, 1, 0, 52, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(53, 'BOB', 'Bolivian Boliviano', 'Bs', 'Bolivia', 6.9000, 1, 0, 53, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(56, 'VES', 'Venezuelan Bolívar', 'Bs.S', 'Venezuela', 4000000.0000, 1, 0, 54, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(57, 'RUB', 'Russian Ruble', '₽', 'Russia', 75.0000, 1, 0, 55, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(58, 'TRY', 'Turkish Lira', '₺', 'Turkey', 8.5000, 1, 0, 56, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(59, 'ILS', 'Israeli Shekel', '₪', 'Israel', 3.2000, 1, 0, 57, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(60, 'UAH', 'Ukrainian Hryvnia', '₴', 'Ukraine', 27.0000, 1, 0, 58, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(61, 'BYN', 'Belarusian Ruble', 'Br', 'Belarus', 2.5000, 1, 0, 59, '2025-10-05 12:52:57', '2025-10-05 12:52:57'),
(62, 'KZT', 'Kazakhstani Tenge', '₸', 'Kazakhstan', 425.0000, 1, 0, 60, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(63, 'UZS', 'Uzbekistani Som', 'лв', 'Uzbekistan', 10700.0000, 1, 0, 61, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(64, 'KGS', 'Kyrgyzstani Som', 'лв', 'Kyrgyzstan', 84.0000, 1, 0, 62, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(65, 'TJS', 'Tajikistani Somoni', 'SM', 'Tajikistan', 11.0000, 1, 0, 63, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(66, 'TMT', 'Turkmenistani Manat', 'T', 'Turkmenistan', 3.5000, 1, 0, 64, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(67, 'AFN', 'Afghan Afghani', '؋', 'Afghanistan', 80.0000, 1, 0, 65, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(68, 'IRR', 'Iranian Rial', '﷼', 'Iran', 42000.0000, 1, 0, 66, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(69, 'IQD', 'Iraqi Dinar', 'ع.د', 'Iraq', 1460.0000, 1, 0, 67, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(70, 'SYP', 'Syrian Pound', '£', 'Syria', 2500.0000, 1, 0, 68, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(71, 'YER', 'Yemeni Rial', '﷼', 'Yemen', 250.0000, 1, 0, 69, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(72, 'SOS', 'Somali Shilling', 'S', 'Somalia', 580.0000, 1, 0, 70, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(73, 'ETB', 'Ethiopian Birr', 'Br', 'Ethiopia', 45.0000, 1, 0, 71, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(74, 'TZS', 'Tanzanian Shilling', 'TSh', 'Tanzania', 2300.0000, 1, 0, 72, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(75, 'UGX', 'Ugandan Shilling', 'USh', 'Uganda', 3500.0000, 1, 0, 73, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(76, 'RWF', 'Rwandan Franc', 'RF', 'Rwanda', 1000.0000, 1, 0, 74, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(77, 'BIF', 'Burundian Franc', 'FBu', 'Burundi', 2000.0000, 1, 0, 75, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(78, 'MWK', 'Malawian Kwacha', 'MK', 'Malawi', 800.0000, 1, 0, 76, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(79, 'ZMW', 'Zambian Kwacha', 'ZK', 'Zambia', 18.0000, 1, 0, 77, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(80, 'BWP', 'Botswana Pula', 'P', 'Botswana', 11.0000, 1, 0, 78, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(81, 'NAD', 'Namibian Dollar', 'N$', 'Namibia', 14.5000, 1, 0, 79, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(82, 'SZL', 'Swazi Lilangeni', 'L', 'Eswatini', 14.5000, 1, 0, 80, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(83, 'LSL', 'Lesotho Loti', 'L', 'Lesotho', 14.5000, 1, 0, 81, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(84, 'MUR', 'Mauritian Rupee', '₨', 'Mauritius', 40.0000, 1, 0, 82, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(85, 'SCR', 'Seychellois Rupee', '₨', 'Seychelles', 13.5000, 1, 0, 83, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(86, 'MAD', 'Moroccan Dirham', 'د.م.', 'Morocco', 9.0000, 1, 0, 84, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(87, 'TND', 'Tunisian Dinar', 'د.ت', 'Tunisia', 2.8000, 1, 0, 85, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(88, 'DZD', 'Algerian Dinar', 'د.ج', 'Algeria', 135.0000, 1, 0, 86, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(89, 'LYD', 'Libyan Dinar', 'ل.د', 'Libya', 4.5000, 1, 0, 87, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(90, 'SDG', 'Sudanese Pound', 'ج.س.', 'Sudan', 55.0000, 1, 0, 88, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(91, 'SSP', 'South Sudanese Pound', '£', 'South Sudan', 300.0000, 1, 0, 89, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(92, 'CDF', 'Congolese Franc', 'FC', 'Democratic Republic of Congo', 2000.0000, 1, 0, 90, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(93, 'XAF', 'Central African CFA Franc', 'FCFA', 'Central African Republic', 550.0000, 1, 0, 91, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(94, 'XOF', 'West African CFA Franc', 'CFA', 'Senegal', 550.0000, 1, 0, 92, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(95, 'GMD', 'Gambian Dalasi', 'D', 'Gambia', 52.0000, 1, 0, 93, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(96, 'GNF', 'Guinean Franc', 'FG', 'Guinea', 10200.0000, 1, 0, 94, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(97, 'SLL', 'Sierra Leonean Leone', 'Le', 'Sierra Leone', 10200.0000, 1, 0, 95, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(98, 'LRD', 'Liberian Dollar', 'L$', 'Liberia', 160.0000, 1, 0, 96, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(99, 'CVE', 'Cape Verdean Escudo', '$', 'Cape Verde', 100.0000, 1, 0, 97, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(100, 'STN', 'São Tomé and Príncipe Dobra', 'Db', 'São Tomé and Príncipe', 22.0000, 1, 0, 98, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(101, 'AOA', 'Angolan Kwanza', 'Kz', 'Angola', 650.0000, 1, 0, 99, '2025-10-05 12:52:58', '2025-10-05 12:52:58'),
(102, 'ZWL', 'Zimbabwean Dollar', 'Z$', 'Zimbabwe', 4000000.0000, 1, 0, 100, '2025-10-05 12:52:58', '2025-10-05 12:52:58');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `department_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `manager_name` varchar(255) DEFAULT NULL,
  `manager_email` varchar(255) DEFAULT NULL,
  `manager_phone` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `company_id`, `location_id`, `department_name`, `description`, `manager_name`, `manager_email`, `manager_phone`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 6, 1, 'Accounts Department', NULL, NULL, NULL, NULL, 1, 1, '2025-09-14 04:36:38', '2025-09-14 04:36:38');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `company_id`, `location_name`, `address`, `city`, `state`, `country`, `postal_code`, `phone`, `email`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 11, 'BASFOOT LOCATION 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2025-09-14 04:19:02', '2025-10-05 02:19:54');

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `module_id` bigint(20) UNSIGNED NOT NULL,
  `section_id` bigint(20) UNSIGNED NOT NULL,
  `menu_name` varchar(255) NOT NULL,
  `route` varchar(255) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `module_id`, `section_id`, `menu_name`, `route`, `icon`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 'Modules', '/system/AddModules', 'settings', 1, 1, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(2, 1, 1, 'Sections', '/system/sections', 'layers', 1, 2, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(3, 1, 1, 'Menus', '/system/menus', 'list', 1, 3, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(4, 1, 1, 'Packages', '/system/packages', 'package', 1, 4, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(5, 1, 1, 'Package Features', '/system/package-features', 'layers', 1, 5, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(6, 1, 1, 'Locations', '/system/locations', 'building', 1, 6, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(7, 1, 1, 'Departments', '/system/departments', 'users', 1, 7, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(8, 1, 1, 'Companies', '/system/companies', 'building-2', 1, 8, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(9, 1, 1, 'Users', '/system/users', 'users', 1, 9, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(10, 2, 2, 'Chart of Accounts Form', '/accounts/chart-of-accounts', 'file-text', 1, 1, '2025-10-05 12:14:58', '2025-10-05 12:14:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_07_171619_create_tbl_admin', 1),
(5, '2025_08_09_081435_create_user_sessions_table', 1),
(6, '2025_08_26_145841_create_modules_table', 2),
(7, '2025_09_07_000001_create_sections_table', 3),
(8, '2025_09_07_000002_create_menus_table', 3),
(9, '2025_09_07_000003_drop_fk_constraints_from_sections_menus', 4),
(10, '2025_09_14_062813_create_companies_table', 5),
(11, '2025_09_14_071535_create_packages_table', 6),
(12, '2025_09_14_071543_create_package_features_table', 6),
(15, '2025_09_14_072051_create_package_modules_table', 7),
(16, '2025_09_14_072101_create_package_sections_table', 7),
(19, '2025_09_14_073345_remove_unique_constraints_from_menus_table', 8),
(20, '2025_09_14_075414_drop_package_modules_and_package_sections_tables', 9),
(21, '2025_09_14_075500_simple_drop_package_tables', 9),
(22, '2025_09_14_090059_create_locations_table', 10),
(23, '2025_09_14_090105_create_departments_table', 10),
(24, '2025_10_05_064813_add_package_and_license_fields_to_companies_table', 11),
(25, '2025_10_05_065253_create_roles_table', 12),
(26, '2025_10_05_065305_create_role_features_table', 12),
(27, '2025_10_05_065719_create_company_roles_table', 13),
(28, '2025_10_05_070418_remove_roles_system', 14),
(29, '2025_10_05_070440_create_user_rights_table', 14),
(30, '2025_10_05_173823_create_chart_of_accounts_table', 15),
(31, '2025_10_05_174421_add_company_location_to_chart_of_accounts_table', 16),
(32, '2025_10_05_174738_remove_foreign_keys_from_chart_of_accounts_table', 17),
(33, '2025_10_05_174754_create_currencies_table', 17),
(34, '2025_10_05_175209_update_exchange_rate_precision_in_currencies_table', 18);

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `module_name` varchar(35) NOT NULL,
  `folder_name` varchar(35) NOT NULL,
  `slug` varchar(35) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `module_name`, `folder_name`, `slug`, `image`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'System (Admin Panel)', 'system', 'system-admin-panel', NULL, 1, 1, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(2, 'Account Management', 'accounts', 'account-management', 'accounts-icon.png', 1, 2, '2025-10-05 12:14:35', '2025-10-05 12:14:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `package_name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `package_name`, `slug`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Starter', 'starter', 1, 0, '2025-09-14 03:53:10', '2025-09-14 03:55:17', NULL),
(2, 'Plus', 'plus', 1, 1, '2025-09-14 03:55:25', '2025-09-14 03:55:25', NULL),
(3, 'Premium', 'premium', 1, 2, '2025-09-14 03:55:38', '2025-09-14 03:55:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `package_features`
--

CREATE TABLE `package_features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `package_id` bigint(20) UNSIGNED NOT NULL,
  `menu_id` bigint(20) UNSIGNED NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `package_features`
--

INSERT INTO `package_features` (`id`, `package_id`, `menu_id`, `is_enabled`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(2, 2, 2, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(3, 2, 3, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(4, 2, 4, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(5, 2, 5, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(6, 2, 6, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(7, 2, 7, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(8, 2, 8, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(9, 2, 9, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12'),
(10, 2, 10, 1, '2025-10-05 13:14:12', '2025-10-05 13:14:12');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `module_id` bigint(20) UNSIGNED NOT NULL,
  `section_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `module_id`, `section_name`, `slug`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Configuration', 'configuration', 1, 1, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(2, 2, 'Chart of Accounts', 'chart-of-accounts', 1, 2, '2025-10-05 12:19:22', '2025-10-05 12:19:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('auOwxLZ7LU8BQuT6CH8Pbp9JeUqTHhIPYBeaKigb', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoidE5EY0swNE85R2cwMVY3bGRPeE4zcjlNeTNPb1JjRVRrbFpiVUNjWCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zeXN0ZW0vbWVudXMvYnktbW9kdWxlLzEiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjEwOiJhdXRoX3Rva2VuIjtzOjgwOiJCRElLNllnTHVFcnYxYzVYR0c1dzV1Qm1vUzJ0R2N3QTJqSzFLMkdkeUZLWEQ5cTZNQk00WDBsbWdaZFlIbU5WWVpDQnJkNmJacTNvNXZCcCI7czo3OiJ1c2VyX2lkIjtpOjE7fQ==', 1759651492);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fname` varchar(100) NOT NULL,
  `mname` varchar(100) DEFAULT NULL,
  `lname` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `loginid` varchar(255) NOT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `comp_id` bigint(20) UNSIGNED DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED DEFAULT NULL,
  `dept_id` bigint(20) UNSIGNED DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive','suspended','pending') NOT NULL DEFAULT 'active',
  `role` enum('super_admin','admin','manager','user') NOT NULL DEFAULT 'admin',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `avatar` varchar(255) DEFAULT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'UTC',
  `language` varchar(10) NOT NULL DEFAULT 'en',
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `theme` enum('light','dark','system') NOT NULL DEFAULT 'system',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `failed_login_attempts` int(11) NOT NULL DEFAULT 0,
  `locked_until` timestamp NULL DEFAULT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `recovery_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recovery_codes`)),
  `session_id` varchar(255) DEFAULT NULL,
  `device_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`device_info`)),
  `force_password_change` tinyint(1) NOT NULL DEFAULT 0,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `login_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`login_history`)),
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_users`
--

INSERT INTO `tbl_users` (`id`, `fname`, `mname`, `lname`, `email`, `phone`, `loginid`, `pincode`, `comp_id`, `location_id`, `dept_id`, `email_verified_at`, `password`, `token`, `remember_token`, `status`, `role`, `permissions`, `avatar`, `timezone`, `language`, `currency`, `theme`, `last_login_at`, `last_login_ip`, `failed_login_attempts`, `locked_until`, `two_factor_enabled`, `two_factor_secret`, `recovery_codes`, `session_id`, `device_info`, `force_password_change`, `password_changed_at`, `login_history`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `last_activity`) VALUES
(1, 'System', NULL, 'Administrator', 'admin@erpsystem.com', '+1234567890', 'admin', '12345', 11, 1, 1, NULL, '$2y$12$QZ/KZc6V/wK3YGJDrzVLaehK4R7EU.wRkOugBu/7kgg47SxX3yHPm', '3a0b6d59b76f29272058562463c6a0840f8ce87f188b122532fc65ecdd2b1d5c', 'fOfn3swcqQmJjKRAUHDZNt2PMhlSYvUttFXpBlCFgm75eoQwsuLj5tapmbJIa3P8XlkYHq1DEJeEShGLaUkhbsdsaCU2utqSeZbF', 'active', 'super_admin', '{\"users\":[\"create\",\"read\",\"update\",\"delete\"],\"financial\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"create\",\"read\",\"update\",\"delete\"],\"settings\":[\"create\",\"read\",\"update\",\"delete\"],\"system\":[\"create\",\"read\",\"update\",\"delete\"]}', NULL, 'UTC', 'en', 'USD', 'system', '2025-10-05 13:21:41', '127.0.0.1', 0, NULL, 0, NULL, NULL, '0azGByajE8qOS3IXrrFfx6kYsX8mjIwhPPXDPljw', NULL, 0, '2025-08-14 10:19:49', '[{\"timestamp\":\"2025-10-05T18:21:41.367032Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:20:23.633537Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:19:26.234679Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:14:32.822610Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:14:24.965821Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T16:14:12.639753Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T16:11:07.339733Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T16:03:47.239324Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T15:30:48.289487Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T15:04:15.476171Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T15:02:32.769691Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T15:02:01.980624Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T14:54:46.102193Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T14:52:57.710543Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T14:50:53.638158Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T14:50:49.083904Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T14:50:04.328881Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T14:46:20.001957Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T14:46:17.760901Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T14:44:55.156103Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true}]', NULL, NULL, '2025-08-14 10:19:49', '2025-10-05 13:21:41', NULL, NULL),
(2, 'Finance', NULL, 'Manager', 'finance@erpsystem.com', '+1234567891', 'finance_mgr', '12346', 1, 1, 2, NULL, '$2y$12$.Kwr9rgMKPjrBG45kDk8x.kTh/l9u1VSLPMZ/BAI0n2Jw69lIf9SG', NULL, NULL, 'active', 'manager', '{\"financial\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"read\",\"create\"],\"users\":[\"read\"]}', NULL, 'UTC', 'en', 'USD', 'light', NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 0, '2025-08-14 10:19:50', NULL, NULL, NULL, '2025-08-14 10:19:50', '2025-08-14 10:19:50', NULL, NULL),
(3, 'Account', NULL, 'Executive', 'accounts@erpsystem.com', '+1234567892', 'acc_exec', '12347', 1, 1, 2, NULL, '$2y$12$voUVJ1fWNi9mo0rkJppxZ.V96Gn0MF.y6L1KSjKBz7tJGp/7/QN3m', NULL, NULL, 'active', 'user', '{\"financial\":[\"create\",\"read\",\"update\"],\"reports\":[\"read\"]}', NULL, 'Asia/Karachi', 'en', 'PKR', 'dark', NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 1, '2025-05-14 10:19:50', NULL, NULL, NULL, '2025-08-14 10:19:50', '2025-08-14 10:19:50', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_rights`
--

CREATE TABLE `user_rights` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `menu_id` bigint(20) UNSIGNED NOT NULL,
  `can_view` tinyint(1) NOT NULL DEFAULT 1,
  `can_add` tinyint(1) NOT NULL DEFAULT 0,
  `can_edit` tinyint(1) NOT NULL DEFAULT 0,
  `can_delete` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_rights`
--

INSERT INTO `user_rights` (`id`, `user_id`, `menu_id`, `can_view`, `can_add`, `can_edit`, `can_delete`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(27, 1, 8, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(28, 1, 2, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(29, 1, 3, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(30, 1, 4, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(31, 1, 5, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(32, 1, 6, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(33, 1, 7, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(34, 1, 9, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00'),
(35, 1, 10, 1, 1, 1, 1, '2025-10-05 18:11:24', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `device_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`device_info`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_activity` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `terminated_at` timestamp NULL DEFAULT NULL,
  `termination_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chart_of_accounts_account_code_unique` (`account_code`),
  ADD KEY `chart_of_accounts_account_code_index` (`account_code`),
  ADD KEY `chart_of_accounts_account_type_index` (`account_type`),
  ADD KEY `chart_of_accounts_parent_account_id_index` (`parent_account_id`),
  ADD KEY `chart_of_accounts_account_level_index` (`account_level`),
  ADD KEY `chart_of_accounts_status_index` (`status`),
  ADD KEY `chart_of_accounts_comp_id_index` (`comp_id`),
  ADD KEY `chart_of_accounts_location_id_index` (`location_id`),
  ADD KEY `chart_of_accounts_comp_id_location_id_index` (`comp_id`,`location_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `companies_company_code_unique` (`company_code`),
  ADD UNIQUE KEY `companies_registration_number_unique` (`registration_number`),
  ADD UNIQUE KEY `companies_email_unique` (`email`),
  ADD UNIQUE KEY `companies_tax_id_unique` (`tax_id`),
  ADD KEY `companies_status_subscription_status_index` (`status`),
  ADD KEY `companies_country_state_province_index` (`country`,`state_province`),
  ADD KEY `companies_industry_status_index` (`industry`,`status`),
  ADD KEY `companies_created_at_index` (`created_at`),
  ADD KEY `companies_created_by_foreign` (`created_by`),
  ADD KEY `companies_updated_by_foreign` (`updated_by`),
  ADD KEY `companies_package_id_foreign` (`package_id`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `currencies_code_unique` (`code`),
  ADD KEY `currencies_is_active_index` (`is_active`),
  ADD KEY `currencies_is_base_currency_index` (`is_base_currency`),
  ADD KEY `currencies_sort_order_index` (`sort_order`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `departments_location_id_department_name_unique` (`location_id`,`department_name`),
  ADD KEY `departments_company_id_foreign` (`company_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `locations_company_id_location_name_unique` (`company_id`,`location_name`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menus_module_id_section_id_status_sort_order_index` (`module_id`,`section_id`,`status`,`sort_order`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `modules_module_name_unique` (`module_name`),
  ADD UNIQUE KEY `modules_folder_name_unique` (`folder_name`),
  ADD UNIQUE KEY `modules_slug_unique` (`slug`),
  ADD KEY `modules_status_sort_order_index` (`status`,`sort_order`),
  ADD KEY `modules_created_at_index` (`created_at`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `packages_slug_unique` (`slug`),
  ADD KEY `packages_status_sort_order_index` (`status`,`sort_order`);

--
-- Indexes for table `package_features`
--
ALTER TABLE `package_features`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `package_features_package_id_menu_id_unique` (`package_id`,`menu_id`),
  ADD KEY `package_features_menu_id_foreign` (`menu_id`),
  ADD KEY `package_features_package_id_is_enabled_index` (`package_id`,`is_enabled`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sections_module_id_section_name_unique` (`module_id`,`section_name`),
  ADD UNIQUE KEY `sections_slug_unique` (`slug`),
  ADD KEY `sections_module_id_status_sort_order_index` (`module_id`,`status`,`sort_order`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tbl_users_email_unique` (`email`),
  ADD UNIQUE KEY `tbl_users_loginid_unique` (`loginid`),
  ADD KEY `tbl_users_email_status_index` (`email`,`status`),
  ADD KEY `tbl_users_loginid_status_index` (`loginid`,`status`),
  ADD KEY `tbl_users_comp_id_location_id_dept_id_index` (`comp_id`,`location_id`,`dept_id`),
  ADD KEY `tbl_users_last_login_at_index` (`last_login_at`),
  ADD KEY `tbl_users_created_at_index` (`created_at`),
  ADD KEY `tbl_users_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_rights`
--
ALTER TABLE `user_rights`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_sessions_user_id_is_active_index` (`user_id`,`is_active`),
  ADD KEY `user_sessions_user_id_session_id_index` (`user_id`,`session_id`),
  ADD KEY `user_sessions_expires_at_is_active_index` (`expires_at`,`is_active`),
  ADD KEY `user_sessions_session_id_index` (`session_id`),
  ADD KEY `user_sessions_is_active_index` (`is_active`),
  ADD KEY `user_sessions_last_activity_index` (`last_activity`),
  ADD KEY `user_sessions_expires_at_index` (`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `package_features`
--
ALTER TABLE `package_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_rights`
--
ALTER TABLE `user_rights`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD CONSTRAINT `chart_of_accounts_parent_account_id_foreign` FOREIGN KEY (`parent_account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `companies_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `companies_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `departments_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_rights`
--
ALTER TABLE `user_rights`
  ADD CONSTRAINT `user_rights_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
