-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2026 at 11:02 PM
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
-- Table structure for table `account_configurations`
--

CREATE TABLE `account_configurations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `comp_id` bigint(20) DEFAULT NULL,
  `location_id` bigint(20) DEFAULT NULL,
  `account_id` bigint(20) DEFAULT NULL,
  `account_code` varchar(191) DEFAULT NULL,
  `account_name` varchar(191) DEFAULT NULL,
  `account_level` tinyint(4) DEFAULT NULL,
  `config_type` enum('cash','bank','petty_cash','accounts_receivable','inventory','fixed_asset','intangible_asset','investment','long_term_investment','short_term_investment','prepaid_expense','input_tax','security_deposit','employee_advance','deferred_tax_asset','other_asset','accounts_payable','accrued_expense','short_term_loan','long_term_loan','tax_payable','output_tax','unearned_revenue','other_liability','capital','drawings','retained_earnings','sales','service_income','interest_income','other_income','purchase','cost_of_goods_sold','salary_expense','rent_expense','utility_expense','depreciation_expense','amortization_expense','interest_expense','insurance_expense','maintenance_expense','marketing_expense','travel_expense','office_expense','other_expense','other') DEFAULT 'other',
  `description` varchar(191) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account_configurations`
--

INSERT INTO `account_configurations` (`id`, `comp_id`, `location_id`, `account_id`, `account_code`, `account_name`, `account_level`, `config_type`, `description`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 1, 26, '100010001000001', 'Cash in Hands', 4, 'cash', NULL, 1, '2026-03-01 14:50:36', '2026-03-01 14:50:36', NULL),
(2, 1, 1, 9, '100010003000000', 'Bank Account', 3, 'bank', NULL, 1, '2026-03-01 15:13:05', '2026-03-01 15:13:05', NULL),
(3, 1, 1, 7, '100010001000000', 'Cash Account / Cash In Hand', 3, 'cash', 'Cash on hand and petty cash accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(4, 1, 1, 8, '100010002000000', 'Petty Cash Account', 3, 'cash', 'Cash on hand and petty cash accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(5, 1, 1, 56, '200020001000000', 'Bank Loan Account', 3, 'bank', 'Bank accounts for transactions', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(6, 1, 1, 244, '500040001000000', 'Bank Charges Account', 3, 'bank', 'Bank accounts for transactions', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(7, 1, 1, 249, '500040006000000', 'Bank Overdraft Interest Account', 3, 'bank', 'Bank accounts for transactions', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(8, 1, 1, 10, '100010004000000', 'Accounts Receivable', 3, 'accounts_receivable', 'Customer receivables and trade debtors', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(9, 1, 1, 301, '100010007000000', 'Trade Receivables / Debtors', 3, 'accounts_receivable', 'Customer receivables and trade debtors', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(10, 1, 1, 180, '400040003000000', 'Customer Rebates Account', 3, 'accounts_receivable', 'Customer receivables and trade debtors', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(11, 1, 1, 341, '200010015000000', 'Advance from Customers', 3, 'accounts_receivable', 'Customer receivables and trade debtors', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(12, 1, 1, 50, '200010001000000', 'Accounts Payable Account', 3, 'accounts_payable', 'Supplier payables and trade creditors', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(13, 1, 1, 325, '200010007000000', 'Trade Payables / Creditors', 3, 'accounts_payable', 'Supplier payables and trade creditors', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(14, 1, 1, 326, '200010008000000', 'Other Creditors', 3, 'accounts_payable', 'Supplier payables and trade creditors', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(15, 1, 1, 11, '100010005000000', 'Inventory Account', 3, 'inventory', 'Inventory and stock accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(16, 1, 1, 321, '100050004000000', 'Stock Investments / Equity Shares', 3, 'inventory', 'Inventory and stock accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(17, 1, 1, 214, '500010001000000', 'Raw Material Account', 3, 'inventory', 'Inventory and stock accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(18, 1, 1, 13, '100020001000000', 'Land Account', 3, 'fixed_asset', 'Fixed assets and property', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(19, 1, 1, 14, '100020002000000', 'Building Account', 3, 'fixed_asset', 'Fixed assets and property', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(20, 1, 1, 15, '100020003000000', 'Machinery Account', 3, 'fixed_asset', 'Fixed assets and property', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(21, 1, 1, 17, '100020005000000', 'Vehicle Account', 3, 'fixed_asset', 'Fixed assets and property', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(22, 1, 1, 16, '100020004000000', 'Furniture & Fixtures', 3, 'fixed_asset', 'Fixed assets and property', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(23, 1, 1, 221, '500010008000000', 'Depreciation - Factory Equipment Account', 3, 'fixed_asset', 'Fixed assets and property', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(24, 1, 1, 231, '500020008000000', 'Depreciation - Office Equipment Account', 3, 'fixed_asset', 'Fixed assets and property', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(25, 1, 1, 12, '100010006000000', 'Prepaid Expenses', 3, 'prepaid_expense', 'Prepaid expenses and advances', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(26, 1, 1, 308, '100010011000000', 'GST / VAT Receivable', 3, 'input_tax', 'Input tax and VAT receivable', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(27, 1, 1, 307, '100010010000000', 'Income Tax Receivable', 3, 'input_tax', 'Input tax and VAT receivable', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(28, 1, 1, 309, '100010012000000', 'Sales Tax Receivable', 3, 'input_tax', 'Input tax and VAT receivable', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(29, 1, 1, 52, '200010003000000', 'Short-term Loan Account', 3, 'short_term_loan', 'Short-term borrowings', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(30, 1, 1, 59, '200020004000000', 'Mortgage Payable Account', 3, 'long_term_loan', 'Long-term borrowings and mortgages', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(31, 1, 1, 330, '200010010000000', 'GST / VAT Payable', 3, 'tax_payable', 'Tax payables and liabilities', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(32, 1, 1, 53, '200010004000000', 'Tax Payable Account', 3, 'tax_payable', 'Tax payables and liabilities', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(33, 1, 1, 329, '200010009000000', 'Income Tax Payable', 3, 'tax_payable', 'Tax payables and liabilities', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(34, 1, 1, 331, '200010011000000', 'Sales Tax Payable', 3, 'tax_payable', 'Tax payables and liabilities', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(35, 1, 1, 60, '200030001000000', 'Provision for Income Tax', 3, 'tax_payable', 'Tax payables and liabilities', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(36, 1, 1, 307, '100010010000000', 'Income Tax Receivable', 3, 'tax_payable', 'Tax payables and liabilities', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(37, 1, 1, 87, '300010001000000', 'Authorized Share Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(38, 1, 1, 88, '300010002000000', 'Issued Share Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(39, 1, 1, 89, '300010003000000', 'Subscribed Share Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(40, 1, 1, 90, '300010004000000', 'Paid-up Share Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(41, 1, 1, 91, '300010005000000', 'Preference Share Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(42, 1, 1, 92, '300010006000000', 'Ordinary Share Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(43, 1, 1, 95, '300020002000000', 'Capital Reserve Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(44, 1, 1, 106, '300040001000000', 'Owner\'s Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(45, 1, 1, 107, '300040002000000', 'Partner A Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(46, 1, 1, 108, '300040003000000', 'Partner B Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(47, 1, 1, 109, '300040004000000', 'Director Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(48, 1, 1, 110, '300040005000000', 'Proprietor Capital Account', 3, 'capital', 'Capital and equity accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(49, 1, 1, 101, '300030001000000', 'Opening Retained Earnings Account', 3, 'retained_earnings', 'Retained earnings and reserves', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(50, 1, 1, 105, '300030005000000', 'Accumulated Profits Account', 3, 'retained_earnings', 'Retained earnings and reserves', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(51, 1, 1, 158, '400010001000000', 'Sales Revenue Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(52, 1, 1, 173, '400030002000000', 'Scrap Sales Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(53, 1, 1, 178, '400040001000000', 'Sales Discounts Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(54, 1, 1, 235, '500030002000000', 'Sales Commission Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(55, 1, 1, 238, '500030005000000', 'Sales Staff Salaries Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(56, 1, 1, 242, '500030009000000', 'After-Sales Service Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(57, 1, 1, 309, '100010012000000', 'Sales Tax Receivable', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(58, 1, 1, 331, '200010011000000', 'Sales Tax Payable', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(59, 1, 1, 64, '200040002000000', 'Deferred Revenue', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(60, 1, 1, 159, '400010002000000', 'Service Revenue Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(61, 1, 1, 160, '400010003000000', 'Product Revenue Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(62, 1, 1, 162, '400010005000000', 'Maintenance Revenue Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(63, 1, 1, 163, '400010006000000', 'Subscription Revenue Account', 3, 'sales', 'Sales revenue accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(64, 1, 1, 159, '400010002000000', 'Service Revenue Account', 3, 'service_income', 'Service and consulting income', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(65, 1, 1, 215, '500010002000000', 'Purchase Account', 3, 'purchase', 'Purchase accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(66, 1, 1, 216, '500010003000000', 'Purchase Returns Account', 3, 'purchase', 'Purchase accounts', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(67, 1, 1, 54, '200010005000000', 'Wages Payable Account', 3, 'salary_expense', 'Salary and wage expenses', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(68, 1, 1, 219, '500010006000000', 'Factory Wages Account', 3, 'salary_expense', 'Salary and wage expenses', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(69, 1, 1, 161, '400010004000000', 'Rental Income Account', 3, 'rent_expense', 'Rent and rental expenses', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(70, 1, 1, 229, '500020006000000', 'IT & Internet Expenses Account', 3, 'utility_expense', 'Utility expenses', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(71, 1, 1, 221, '500010008000000', 'Depreciation - Factory Equipment Account', 3, 'depreciation_expense', 'Depreciation expenses', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(72, 1, 1, 231, '500020008000000', 'Depreciation - Office Equipment Account', 3, 'depreciation_expense', 'Depreciation expenses', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(73, 1, 1, 251, '500050002000000', 'Depreciation - Other Assets Account', 3, 'depreciation_expense', 'Depreciation expenses', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(74, 1, 1, 319, '100020007000000', 'Accumulated Depreciation - ROU', 3, 'depreciation_expense', 'Depreciation expenses', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(75, 1, 1, 245, '500040002000000', 'Interest Expense Account', 3, 'interest_expense', 'Interest and finance costs', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(76, 1, 1, 362, '500040007000000', 'Lease Interest Expense', 3, 'interest_expense', 'Interest and finance costs', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(77, 1, 1, 244, '500040001000000', 'Bank Charges Account', 3, 'interest_expense', 'Interest and finance costs', 1, '2026-03-01 15:14:51', '2026-03-01 15:14:51', NULL),
(78, 1, 1, 27, NULL, NULL, NULL, 'petty_cash', 'Auto-configured: Petty Cash', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(79, 1, 1, 28, NULL, NULL, NULL, 'bank', 'Auto-configured: HBL', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(80, 1, 1, 29, NULL, NULL, NULL, 'accounts_receivable', 'Auto-configured: Accounts Receivable', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(81, 1, 1, 30, NULL, NULL, NULL, 'inventory', 'Auto-configured: Inventory', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(82, 1, 1, 31, NULL, NULL, NULL, 'prepaid_expense', 'Auto-configured: Prepaid Expenses', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(83, 1, 1, 32, NULL, NULL, NULL, 'fixed_asset', 'Auto-configured: Land', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(84, 1, 1, 33, NULL, NULL, NULL, 'fixed_asset', 'Auto-configured: Buildings', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(85, 1, 1, 34, NULL, NULL, NULL, 'fixed_asset', 'Auto-configured: Machinery', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(86, 1, 1, 35, NULL, NULL, NULL, 'fixed_asset', 'Auto-configured: Furniture and Fixtures', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(87, 1, 1, 36, NULL, NULL, NULL, 'fixed_asset', 'Auto-configured: Vehicles', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(88, 1, 1, 37, NULL, NULL, NULL, 'intangible_asset', 'Auto-configured: Goodwill', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(89, 1, 1, 38, NULL, NULL, NULL, 'intangible_asset', 'Auto-configured: Software Licenses', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(90, 1, 1, 39, NULL, NULL, NULL, 'intangible_asset', 'Auto-configured: Patents and Trademarks', 1, '2026-03-01 15:47:46', '2026-03-01 15:47:46', NULL),
(91, 1, 1, 40, NULL, NULL, NULL, 'long_term_investment', 'Auto-configured: Long-term Investments', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(92, 1, 1, 41, NULL, NULL, NULL, 'short_term_investment', 'Auto-configured: Short-term Investments', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(93, 1, 1, 42, NULL, NULL, NULL, 'deferred_tax_asset', 'Auto-configured: Deferred Tax Asset', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(94, 1, 1, 43, NULL, NULL, NULL, 'security_deposit', 'Auto-configured: Security Deposits', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(95, 1, 1, 44, NULL, NULL, NULL, 'employee_advance', 'Auto-configured: Employee Advances', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(96, 1, 1, 65, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Accounts Payable', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(97, 1, 1, 66, NULL, NULL, NULL, 'accrued_expense', 'Auto-configured: Accrued Expenses', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(98, 1, 1, 67, NULL, NULL, NULL, 'short_term_loan', 'Auto-configured: Short-term Loans', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(99, 1, 1, 68, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Taxes Payable', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(100, 1, 1, 69, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Wages Payable', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(101, 1, 1, 70, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Interest Payable', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(102, 1, 1, 71, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Bank Loans', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(103, 1, 1, 72, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Lease Obligations', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(104, 1, 1, 73, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Bonds Payable', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(105, 1, 1, 74, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Mortgage Payable', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(106, 1, 1, 75, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Provision for Income Tax', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(107, 1, 1, 76, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Provision for Bonus', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(108, 1, 1, 77, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Provision for Gratuity', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(109, 1, 1, 78, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Deferred Tax Liability', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(110, 1, 1, 79, NULL, NULL, NULL, 'unearned_revenue', 'Auto-configured: Deferred Revenue', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(111, 1, 1, 120, NULL, NULL, NULL, 'capital', 'Auto-configured: Authorized Share Capital', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(112, 1, 1, 121, NULL, NULL, NULL, 'capital', 'Auto-configured: Issued Share Capital', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(113, 1, 1, 122, NULL, NULL, NULL, 'capital', 'Auto-configured: Subscribed Share Capital', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(114, 1, 1, 123, NULL, NULL, NULL, 'capital', 'Auto-configured: Paid-up Share Capital', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(115, 1, 1, 124, NULL, NULL, NULL, 'capital', 'Auto-configured: Preference Share Capital', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(116, 1, 1, 125, NULL, NULL, NULL, 'capital', 'Auto-configured: Ordinary Share Capital', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(117, 1, 1, 126, NULL, NULL, NULL, 'capital', 'Auto-configured: Treasury Shares', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(118, 1, 1, 127, NULL, NULL, NULL, 'capital', 'Auto-configured: General Reserve', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(119, 1, 1, 128, NULL, NULL, NULL, 'capital', 'Auto-configured: Capital Reserve', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(120, 1, 1, 129, NULL, NULL, NULL, 'capital', 'Auto-configured: Revaluation Reserve', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(121, 1, 1, 130, NULL, NULL, NULL, 'capital', 'Auto-configured: Share Premium Account', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(122, 1, 1, 131, NULL, NULL, NULL, 'capital', 'Auto-configured: Statutory Reserve', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(123, 1, 1, 132, NULL, NULL, NULL, 'capital', 'Auto-configured: Investment Fluctuation Reserve', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(124, 1, 1, 133, NULL, NULL, NULL, 'capital', 'Auto-configured: Foreign Currency Translation Reserve', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(125, 1, 1, 134, NULL, NULL, NULL, 'retained_earnings', 'Auto-configured: Opening Retained Earnings', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(126, 1, 1, 135, NULL, NULL, NULL, 'capital', 'Auto-configured: Current Year Profit', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(127, 1, 1, 136, NULL, NULL, NULL, 'capital', 'Auto-configured: Prior Period Adjustments', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(128, 1, 1, 137, NULL, NULL, NULL, 'capital', 'Auto-configured: Transferred to Reserves', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(129, 1, 1, 138, NULL, NULL, NULL, 'retained_earnings', 'Auto-configured: Accumulated Profits', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(130, 1, 1, 139, NULL, NULL, NULL, 'capital', 'Auto-configured: Owner\'s Capital Account', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(131, 1, 1, 140, NULL, NULL, NULL, 'capital', 'Auto-configured: Partner A Capital Account', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(132, 1, 1, 141, NULL, NULL, NULL, 'capital', 'Auto-configured: Partner B Capital Account', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(133, 1, 1, 142, NULL, NULL, NULL, 'capital', 'Auto-configured: Director Capital Account', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(134, 1, 1, 143, NULL, NULL, NULL, 'capital', 'Auto-configured: Proprietor Capital Account', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(135, 1, 1, 144, NULL, NULL, NULL, 'capital', 'Auto-configured: Owner Drawings', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(136, 1, 1, 145, NULL, NULL, NULL, 'drawings', 'Auto-configured: Partner Drawings', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(137, 1, 1, 146, NULL, NULL, NULL, 'drawings', 'Auto-configured: Director Drawings', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(138, 1, 1, 147, NULL, NULL, NULL, 'capital', 'Auto-configured: Personal Expenses (Non-Business)', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(139, 1, 1, 148, NULL, NULL, NULL, 'capital', 'Auto-configured: Unrealized Gain on Investments', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(140, 1, 1, 149, NULL, NULL, NULL, 'capital', 'Auto-configured: Unrealized Loss on Investments', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(141, 1, 1, 150, NULL, NULL, NULL, 'capital', 'Auto-configured: Fair Value Adjustment', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(142, 1, 1, 151, NULL, NULL, NULL, 'capital', 'Auto-configured: Actuarial Gains / Losses on Pensions', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(143, 1, 1, 152, NULL, NULL, NULL, 'capital', 'Auto-configured: Currency Translation Differences (OCI)', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(144, 1, 1, 183, NULL, NULL, NULL, 'sales', 'Auto-configured: Sales Revenue', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(145, 1, 1, 184, NULL, NULL, NULL, 'service_income', 'Auto-configured: Service Revenue', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(146, 1, 1, 185, NULL, NULL, NULL, 'sales', 'Auto-configured: Product Revenue', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(147, 1, 1, 186, NULL, NULL, NULL, 'sales', 'Auto-configured: Rental Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(148, 1, 1, 187, NULL, NULL, NULL, 'sales', 'Auto-configured: Maintenance Revenue', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(149, 1, 1, 188, NULL, NULL, NULL, 'sales', 'Auto-configured: Subscription Revenue', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(150, 1, 1, 189, NULL, NULL, NULL, 'sales', 'Auto-configured: Commission Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(151, 1, 1, 190, NULL, NULL, NULL, 'sales', 'Auto-configured: Consultancy Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(152, 1, 1, 191, NULL, NULL, NULL, 'interest_income', 'Auto-configured: Interest Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(153, 1, 1, 192, NULL, NULL, NULL, 'sales', 'Auto-configured: Dividend Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(154, 1, 1, 193, NULL, NULL, NULL, 'sales', 'Auto-configured: Gain on Sale of Assets', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(155, 1, 1, 194, NULL, NULL, NULL, 'sales', 'Auto-configured: Foreign Exchange Gain', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(156, 1, 1, 195, NULL, NULL, NULL, 'sales', 'Auto-configured: Investment Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(157, 1, 1, 196, NULL, NULL, NULL, 'sales', 'Auto-configured: Royalty Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(158, 1, 1, 197, NULL, NULL, NULL, 'other_income', 'Auto-configured: Miscellaneous Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(159, 1, 1, 198, NULL, NULL, NULL, 'sales', 'Auto-configured: Scrap Sales', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(160, 1, 1, 199, NULL, NULL, NULL, 'sales', 'Auto-configured: Insurance Claim Received', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(161, 1, 1, 200, NULL, NULL, NULL, 'sales', 'Auto-configured: Rebate Received', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(162, 1, 1, 201, NULL, NULL, NULL, 'sales', 'Auto-configured: Refunds & Adjustments', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(163, 1, 1, 202, NULL, NULL, NULL, 'sales', 'Auto-configured: Grant Income', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(164, 1, 1, 203, NULL, NULL, NULL, 'sales', 'Auto-configured: Sales Discounts', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(165, 1, 1, 204, NULL, NULL, NULL, 'sales', 'Auto-configured: Early Payment Discounts', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(166, 1, 1, 205, NULL, NULL, NULL, 'sales', 'Auto-configured: Customer Rebates', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(167, 1, 1, 206, NULL, NULL, NULL, 'sales', 'Auto-configured: Trade Discounts', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(168, 1, 1, 207, NULL, NULL, NULL, 'sales', 'Auto-configured: Loyalty Program Discounts', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(169, 1, 1, 259, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Raw Material Consumed', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(170, 1, 1, 260, NULL, NULL, NULL, 'purchase', 'Auto-configured: Purchases', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(171, 1, 1, 261, NULL, NULL, NULL, 'purchase', 'Auto-configured: Purchase Returns', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(172, 1, 1, 262, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Freight Inward', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(173, 1, 1, 263, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Packing Materials', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(174, 1, 1, 264, NULL, NULL, NULL, 'salary_expense', 'Auto-configured: Factory Wages', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(175, 1, 1, 265, NULL, NULL, NULL, 'rent_expense', 'Auto-configured: Factory Rent', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(176, 1, 1, 266, NULL, NULL, NULL, 'depreciation_expense', 'Auto-configured: Depreciation - Factory Equipment', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(177, 1, 1, 267, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Power and Fuel', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(178, 1, 1, 268, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Direct Labor', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(179, 1, 1, 269, NULL, NULL, NULL, 'salary_expense', 'Auto-configured: Office Salaries', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(180, 1, 1, 270, NULL, NULL, NULL, 'rent_expense', 'Auto-configured: Office Rent', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(181, 1, 1, 271, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Utilities', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(182, 1, 1, 272, NULL, NULL, NULL, 'office_expense', 'Auto-configured: Stationery & Office Supplies', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(183, 1, 1, 273, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Printing & Postage', 1, '2026-03-01 15:48:32', '2026-03-01 15:48:32', NULL),
(184, 1, 1, 274, NULL, NULL, NULL, 'other_expense', 'Auto-configured: IT & Internet Expenses', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(185, 1, 1, 275, NULL, NULL, NULL, 'maintenance_expense', 'Auto-configured: Repairs & Maintenance', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(186, 1, 1, 276, NULL, NULL, NULL, 'depreciation_expense', 'Auto-configured: Depreciation - Office Equipment', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(187, 1, 1, 277, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Professional Fees', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(188, 1, 1, 278, NULL, NULL, NULL, 'travel_expense', 'Auto-configured: Travel & Conveyance', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(189, 1, 1, 279, NULL, NULL, NULL, 'marketing_expense', 'Auto-configured: Advertising & Promotion', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(190, 1, 1, 280, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Sales Commission', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(191, 1, 1, 281, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Freight Outward', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(192, 1, 1, 282, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Delivery & Transportation', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(193, 1, 1, 283, NULL, NULL, NULL, 'salary_expense', 'Auto-configured: Sales Staff Salaries', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(194, 1, 1, 284, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Showroom Expenses', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(195, 1, 1, 285, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Discount Allowed', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(196, 1, 1, 286, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Promotional Samples', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(197, 1, 1, 287, NULL, NULL, NULL, 'other_expense', 'Auto-configured: After-Sales Service', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(198, 1, 1, 288, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Trade Show Expenses', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(199, 1, 1, 289, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Bank Charges', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(200, 1, 1, 290, NULL, NULL, NULL, 'interest_expense', 'Auto-configured: Interest Expense', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(201, 1, 1, 291, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Loan Processing Fees', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(202, 1, 1, 292, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Foreign Exchange Loss', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(203, 1, 1, 293, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Credit Card Fees', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(204, 1, 1, 294, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Bank Overdraft Interest', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(205, 1, 1, 295, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Bad Debts', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(206, 1, 1, 296, NULL, NULL, NULL, 'depreciation_expense', 'Auto-configured: Depreciation - Other Assets', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(207, 1, 1, 297, NULL, NULL, NULL, 'amortization_expense', 'Auto-configured: Amortization Expense', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(208, 1, 1, 298, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Loss on Sale of Assets', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(209, 1, 1, 299, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Donations & Contributions', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(210, 1, 1, 300, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Penalties & Fines', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(211, 1, 1, 304, NULL, NULL, NULL, 'accounts_receivable', 'Auto-configured: Trade Receivables', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(212, 1, 1, 305, NULL, NULL, NULL, 'accounts_receivable', 'Auto-configured: Other Debtors', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(213, 1, 1, 306, NULL, NULL, NULL, 'other_asset', 'Auto-configured: Allowance for Doubtful Debts Reserve', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(214, 1, 1, 310, NULL, NULL, NULL, 'accounts_receivable', 'Auto-configured: Income Tax Receivable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(215, 1, 1, 311, NULL, NULL, NULL, 'accounts_receivable', 'Auto-configured: GST / VAT Receivable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(216, 1, 1, 312, NULL, NULL, NULL, 'accounts_receivable', 'Auto-configured: Sales Tax Receivable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(217, 1, 1, 315, NULL, NULL, NULL, 'accounts_receivable', 'Auto-configured: Loan Receivable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(218, 1, 1, 316, NULL, NULL, NULL, 'accounts_receivable', 'Auto-configured: Lease Receivable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(219, 1, 1, 318, NULL, NULL, NULL, 'other_asset', 'Auto-configured: Right-of-Use Assets - Leased Property', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(220, 1, 1, 320, NULL, NULL, NULL, 'other_asset', 'Auto-configured: Accumulated Depreciation - ROU Assets', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(221, 1, 1, 322, NULL, NULL, NULL, 'short_term_investment', 'Auto-configured: Investment in Shares', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(222, 1, 1, 324, NULL, NULL, NULL, 'other_asset', 'Auto-configured: Assets Held for Sale', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(223, 1, 1, 327, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Trade Payables', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(224, 1, 1, 328, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Other Creditors', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(225, 1, 1, 332, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Income Tax Payable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(226, 1, 1, 333, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: GST / VAT Payable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(227, 1, 1, 334, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Sales Tax Payable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(228, 1, 1, 338, NULL, NULL, NULL, 'accounts_payable', 'Auto-configured: Accrued Salaries Payable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(229, 1, 1, 339, NULL, NULL, NULL, 'accrued_expense', 'Auto-configured: Accrued Leave Liability', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(230, 1, 1, 340, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Employee Benefits Receivable', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(231, 1, 1, 342, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Advance from Customers', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(232, 1, 1, 344, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Current Portion of Long-term Debt', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(233, 1, 1, 347, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Lease Liability - Current', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(234, 1, 1, 348, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Lease Liability - Non-Current', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(235, 1, 1, 351, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Employee Severance Obligation', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(236, 1, 1, 352, NULL, NULL, NULL, 'other_liability', 'Auto-configured: Pension Obligation', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(237, 1, 1, 356, NULL, NULL, NULL, 'rent_expense', 'Auto-configured: Current Tax Expense', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(238, 1, 1, 357, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Deferred Tax Expense', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(239, 1, 1, 360, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Impairment Loss - Goodwill', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(240, 1, 1, 361, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Impairment Loss - Receivables', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(241, 1, 1, 364, NULL, NULL, NULL, 'interest_expense', 'Auto-configured: Lease Interest Expense', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL),
(242, 1, 1, 365, NULL, NULL, NULL, 'other_expense', 'Auto-configured: Finance Lease Interest', 1, '2026-03-01 15:48:33', '2026-03-01 15:48:33', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-active_currencies', 'a:100:{i:0;a:5:{s:5:\"value\";s:3:\"USD\";s:5:\"label\";s:28:\"United States Dollarss (USD)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:6:\"1.0000\";s:7:\"country\";s:13:\"United States\";}i:1;a:5:{s:5:\"value\";s:3:\"EUR\";s:5:\"label\";s:10:\"Euro (EUR)\";s:6:\"symbol\";s:3:\"€\";s:13:\"exchange_rate\";s:6:\"0.8540\";s:7:\"country\";s:14:\"European Union\";}i:2;a:5:{s:5:\"value\";s:3:\"GBP\";s:5:\"label\";s:28:\"British Pound Sterling (GBP)\";s:6:\"symbol\";s:2:\"£\";s:13:\"exchange_rate\";s:6:\"0.7420\";s:7:\"country\";s:14:\"United Kingdom\";}i:3;a:5:{s:5:\"value\";s:3:\"JPY\";s:5:\"label\";s:18:\"Japanese Yen (JPY)\";s:6:\"symbol\";s:2:\"¥\";s:13:\"exchange_rate\";s:8:\"150.0200\";s:7:\"country\";s:5:\"Japan\";}i:4;a:5:{s:5:\"value\";s:3:\"CHF\";s:5:\"label\";s:17:\"Swiss Franc (CHF)\";s:6:\"symbol\";s:3:\"CHF\";s:13:\"exchange_rate\";s:6:\"0.7960\";s:7:\"country\";s:11:\"Switzerland\";}i:5;a:5:{s:5:\"value\";s:3:\"CAD\";s:5:\"label\";s:21:\"Canadian Dollar (CAD)\";s:6:\"symbol\";s:2:\"C$\";s:13:\"exchange_rate\";s:6:\"1.4000\";s:7:\"country\";s:6:\"Canada\";}i:6;a:5:{s:5:\"value\";s:3:\"AUD\";s:5:\"label\";s:23:\"Australian Dollar (AUD)\";s:6:\"symbol\";s:2:\"A$\";s:13:\"exchange_rate\";s:6:\"1.5100\";s:7:\"country\";s:9:\"Australia\";}i:7;a:5:{s:5:\"value\";s:3:\"NZD\";s:5:\"label\";s:24:\"New Zealand Dollar (NZD)\";s:6:\"symbol\";s:3:\"NZ$\";s:13:\"exchange_rate\";s:6:\"1.7100\";s:7:\"country\";s:11:\"New Zealand\";}i:8;a:5:{s:5:\"value\";s:3:\"CNY\";s:5:\"label\";s:18:\"Chinese Yuan (CNY)\";s:6:\"symbol\";s:2:\"¥\";s:13:\"exchange_rate\";s:6:\"7.1300\";s:7:\"country\";s:5:\"China\";}i:9;a:5:{s:5:\"value\";s:3:\"HKD\";s:5:\"label\";s:22:\"Hong Kong Dollar (HKD)\";s:6:\"symbol\";s:3:\"HK$\";s:13:\"exchange_rate\";s:6:\"7.7800\";s:7:\"country\";s:9:\"Hong Kong\";}i:10;a:5:{s:5:\"value\";s:3:\"SGD\";s:5:\"label\";s:22:\"Singapore Dollar (SGD)\";s:6:\"symbol\";s:2:\"S$\";s:13:\"exchange_rate\";s:6:\"1.2900\";s:7:\"country\";s:9:\"Singapore\";}i:11;a:5:{s:5:\"value\";s:3:\"KRW\";s:5:\"label\";s:22:\"South Korean Won (KRW)\";s:6:\"symbol\";s:3:\"₩\";s:13:\"exchange_rate\";s:9:\"1410.7200\";s:7:\"country\";s:11:\"South Korea\";}i:12;a:5:{s:5:\"value\";s:3:\"INR\";s:5:\"label\";s:18:\"Indian Rupee (INR)\";s:6:\"symbol\";s:3:\"₹\";s:13:\"exchange_rate\";s:7:\"88.7800\";s:7:\"country\";s:5:\"India\";}i:13;a:5:{s:5:\"value\";s:3:\"PKR\";s:5:\"label\";s:21:\"Pakistani Rupee (PKR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:8:\"283.2500\";s:7:\"country\";s:8:\"Pakistan\";}i:14;a:5:{s:5:\"value\";s:3:\"BDT\";s:5:\"label\";s:22:\"Bangladeshi Taka (BDT)\";s:6:\"symbol\";s:3:\"৳\";s:13:\"exchange_rate\";s:8:\"121.7500\";s:7:\"country\";s:10:\"Bangladesh\";}i:15;a:5:{s:5:\"value\";s:3:\"LKR\";s:5:\"label\";s:22:\"Sri Lankan Rupee (LKR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:8:\"302.3200\";s:7:\"country\";s:9:\"Sri Lanka\";}i:16;a:5:{s:5:\"value\";s:3:\"NPR\";s:5:\"label\";s:20:\"Nepalese Rupee (NPR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:8:\"142.0500\";s:7:\"country\";s:5:\"Nepal\";}i:17;a:5:{s:5:\"value\";s:3:\"THB\";s:5:\"label\";s:15:\"Thai Baht (THB)\";s:6:\"symbol\";s:3:\"฿\";s:13:\"exchange_rate\";s:7:\"32.4200\";s:7:\"country\";s:8:\"Thailand\";}i:18;a:5:{s:5:\"value\";s:3:\"MYR\";s:5:\"label\";s:23:\"Malaysian Ringgit (MYR)\";s:6:\"symbol\";s:2:\"RM\";s:13:\"exchange_rate\";s:6:\"4.2100\";s:7:\"country\";s:8:\"Malaysia\";}i:19;a:5:{s:5:\"value\";s:3:\"IDR\";s:5:\"label\";s:23:\"Indonesian Rupiah (IDR)\";s:6:\"symbol\";s:2:\"Rp\";s:13:\"exchange_rate\";s:10:\"16600.5900\";s:7:\"country\";s:9:\"Indonesia\";}i:20;a:5:{s:5:\"value\";s:3:\"PHP\";s:5:\"label\";s:21:\"Philippine Peso (PHP)\";s:6:\"symbol\";s:3:\"₱\";s:13:\"exchange_rate\";s:7:\"58.2800\";s:7:\"country\";s:11:\"Philippines\";}i:21;a:5:{s:5:\"value\";s:3:\"VND\";s:5:\"label\";s:21:\"Vietnamese Dong (VND)\";s:6:\"symbol\";s:3:\"₫\";s:13:\"exchange_rate\";s:10:\"26245.6700\";s:7:\"country\";s:7:\"Vietnam\";}i:22;a:5:{s:5:\"value\";s:3:\"AED\";s:5:\"label\";s:16:\"UAE Dirham (AED)\";s:6:\"symbol\";s:5:\"د.إ\";s:13:\"exchange_rate\";s:6:\"3.6700\";s:7:\"country\";s:20:\"United Arab Emirates\";}i:23;a:5:{s:5:\"value\";s:3:\"SAR\";s:5:\"label\";s:17:\"Saudi Riyal (SAR)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:6:\"3.7500\";s:7:\"country\";s:12:\"Saudi Arabia\";}i:24;a:5:{s:5:\"value\";s:3:\"QAR\";s:5:\"label\";s:18:\"Qatari Riyal (QAR)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:6:\"3.6400\";s:7:\"country\";s:5:\"Qatar\";}i:25;a:5:{s:5:\"value\";s:3:\"KWD\";s:5:\"label\";s:19:\"Kuwaiti Dinar (KWD)\";s:6:\"symbol\";s:5:\"د.ك\";s:13:\"exchange_rate\";s:6:\"0.3060\";s:7:\"country\";s:6:\"Kuwait\";}i:26;a:5:{s:5:\"value\";s:3:\"BHD\";s:5:\"label\";s:20:\"Bahraini Dinar (BHD)\";s:6:\"symbol\";s:5:\"د.ب\";s:13:\"exchange_rate\";s:6:\"0.3760\";s:7:\"country\";s:7:\"Bahrain\";}i:27;a:5:{s:5:\"value\";s:3:\"OMR\";s:5:\"label\";s:16:\"Omani Rial (OMR)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:6:\"0.3840\";s:7:\"country\";s:4:\"Oman\";}i:28;a:5:{s:5:\"value\";s:3:\"JOD\";s:5:\"label\";s:21:\"Jordanian Dinar (JOD)\";s:6:\"symbol\";s:5:\"د.ا\";s:13:\"exchange_rate\";s:6:\"0.7090\";s:7:\"country\";s:6:\"Jordan\";}i:29;a:5:{s:5:\"value\";s:3:\"LBP\";s:5:\"label\";s:20:\"Lebanese Pound (LBP)\";s:6:\"symbol\";s:5:\"ل.ل\";s:13:\"exchange_rate\";s:10:\"89500.0000\";s:7:\"country\";s:7:\"Lebanon\";}i:30;a:5:{s:5:\"value\";s:3:\"EGP\";s:5:\"label\";s:20:\"Egyptian Pound (EGP)\";s:6:\"symbol\";s:2:\"£\";s:13:\"exchange_rate\";s:7:\"47.6100\";s:7:\"country\";s:5:\"Egypt\";}i:31;a:5:{s:5:\"value\";s:3:\"ZAR\";s:5:\"label\";s:24:\"South African Rand (ZAR)\";s:6:\"symbol\";s:1:\"R\";s:13:\"exchange_rate\";s:7:\"17.2000\";s:7:\"country\";s:12:\"South Africa\";}i:32;a:5:{s:5:\"value\";s:3:\"NGN\";s:5:\"label\";s:20:\"Nigerian Naira (NGN)\";s:6:\"symbol\";s:3:\"₦\";s:13:\"exchange_rate\";s:9:\"1463.5500\";s:7:\"country\";s:7:\"Nigeria\";}i:33;a:5:{s:5:\"value\";s:3:\"KES\";s:5:\"label\";s:21:\"Kenyan Shilling (KES)\";s:6:\"symbol\";s:3:\"KSh\";s:13:\"exchange_rate\";s:8:\"129.1100\";s:7:\"country\";s:5:\"Kenya\";}i:34;a:5:{s:5:\"value\";s:3:\"GHS\";s:5:\"label\";s:19:\"Ghanaian Cedi (GHS)\";s:6:\"symbol\";s:3:\"₵\";s:13:\"exchange_rate\";s:7:\"12.6100\";s:7:\"country\";s:5:\"Ghana\";}i:35;a:5:{s:5:\"value\";s:3:\"SEK\";s:5:\"label\";s:19:\"Swedish Krona (SEK)\";s:6:\"symbol\";s:2:\"kr\";s:13:\"exchange_rate\";s:6:\"9.3800\";s:7:\"country\";s:6:\"Sweden\";}i:36;a:5:{s:5:\"value\";s:3:\"NOK\";s:5:\"label\";s:21:\"Norwegian Krone (NOK)\";s:6:\"symbol\";s:2:\"kr\";s:13:\"exchange_rate\";s:6:\"9.9300\";s:7:\"country\";s:6:\"Norway\";}i:37;a:5:{s:5:\"value\";s:3:\"DKK\";s:5:\"label\";s:18:\"Danish Krone (DKK)\";s:6:\"symbol\";s:2:\"kr\";s:13:\"exchange_rate\";s:6:\"6.3700\";s:7:\"country\";s:7:\"Denmark\";}i:38;a:5:{s:5:\"value\";s:3:\"PLN\";s:5:\"label\";s:18:\"Polish Zloty (PLN)\";s:6:\"symbol\";s:3:\"zł\";s:13:\"exchange_rate\";s:6:\"3.6300\";s:7:\"country\";s:6:\"Poland\";}i:39;a:5:{s:5:\"value\";s:3:\"CZK\";s:5:\"label\";s:18:\"Czech Koruna (CZK)\";s:6:\"symbol\";s:3:\"Kč\";s:13:\"exchange_rate\";s:7:\"20.7800\";s:7:\"country\";s:14:\"Czech Republic\";}i:40;a:5:{s:5:\"value\";s:3:\"HUF\";s:5:\"label\";s:22:\"Hungarian Forint (HUF)\";s:6:\"symbol\";s:2:\"Ft\";s:13:\"exchange_rate\";s:8:\"332.0100\";s:7:\"country\";s:7:\"Hungary\";}i:41;a:5:{s:5:\"value\";s:3:\"RON\";s:5:\"label\";s:18:\"Romanian Leu (RON)\";s:6:\"symbol\";s:3:\"lei\";s:13:\"exchange_rate\";s:6:\"4.3500\";s:7:\"country\";s:7:\"Romania\";}i:42;a:5:{s:5:\"value\";s:3:\"BGN\";s:5:\"label\";s:19:\"Bulgarian Lev (BGN)\";s:6:\"symbol\";s:4:\"лв\";s:13:\"exchange_rate\";s:6:\"1.6700\";s:7:\"country\";s:8:\"Bulgaria\";}i:43;a:5:{s:5:\"value\";s:3:\"HRK\";s:5:\"label\";s:19:\"Croatian Kuna (HRK)\";s:6:\"symbol\";s:2:\"kn\";s:13:\"exchange_rate\";s:6:\"6.4400\";s:7:\"country\";s:7:\"Croatia\";}i:44;a:5:{s:5:\"value\";s:3:\"RSD\";s:5:\"label\";s:19:\"Serbian Dinar (RSD)\";s:6:\"symbol\";s:6:\"дин\";s:13:\"exchange_rate\";s:8:\"100.1100\";s:7:\"country\";s:6:\"Serbia\";}i:45;a:5:{s:5:\"value\";s:3:\"BRL\";s:5:\"label\";s:20:\"Brazilian Real (BRL)\";s:6:\"symbol\";s:2:\"R$\";s:13:\"exchange_rate\";s:6:\"5.3400\";s:7:\"country\";s:6:\"Brazil\";}i:46;a:5:{s:5:\"value\";s:3:\"MXN\";s:5:\"label\";s:18:\"Mexican Peso (MXN)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:7:\"18.3700\";s:7:\"country\";s:6:\"Mexico\";}i:47;a:5:{s:5:\"value\";s:3:\"ARS\";s:5:\"label\";s:20:\"Argentine Peso (ARS)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:9:\"1429.7500\";s:7:\"country\";s:9:\"Argentina\";}i:48;a:5:{s:5:\"value\";s:3:\"CLP\";s:5:\"label\";s:18:\"Chilean Peso (CLP)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:8:\"963.9800\";s:7:\"country\";s:5:\"Chile\";}i:49;a:5:{s:5:\"value\";s:3:\"COP\";s:5:\"label\";s:20:\"Colombian Peso (COP)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:9:\"3867.9200\";s:7:\"country\";s:8:\"Colombia\";}i:50;a:5:{s:5:\"value\";s:3:\"PEN\";s:5:\"label\";s:18:\"Peruvian Sol (PEN)\";s:6:\"symbol\";s:2:\"S/\";s:13:\"exchange_rate\";s:6:\"3.4600\";s:7:\"country\";s:4:\"Peru\";}i:51;a:5:{s:5:\"value\";s:3:\"UYU\";s:5:\"label\";s:20:\"Uruguayan Peso (UYU)\";s:6:\"symbol\";s:2:\"$U\";s:13:\"exchange_rate\";s:7:\"39.9200\";s:7:\"country\";s:7:\"Uruguay\";}i:52;a:5:{s:5:\"value\";s:3:\"BOB\";s:5:\"label\";s:24:\"Bolivian Boliviano (BOB)\";s:6:\"symbol\";s:2:\"Bs\";s:13:\"exchange_rate\";s:6:\"6.9200\";s:7:\"country\";s:7:\"Bolivia\";}i:53;a:5:{s:5:\"value\";s:3:\"VES\";s:5:\"label\";s:25:\"Venezuelan Bolívar (VES)\";s:6:\"symbol\";s:4:\"Bs.S\";s:13:\"exchange_rate\";s:8:\"187.2900\";s:7:\"country\";s:9:\"Venezuela\";}i:54;a:5:{s:5:\"value\";s:3:\"RUB\";s:5:\"label\";s:19:\"Russian Ruble (RUB)\";s:6:\"symbol\";s:3:\"₽\";s:13:\"exchange_rate\";s:7:\"82.8900\";s:7:\"country\";s:6:\"Russia\";}i:55;a:5:{s:5:\"value\";s:3:\"TRY\";s:5:\"label\";s:18:\"Turkish Lira (TRY)\";s:6:\"symbol\";s:3:\"₺\";s:13:\"exchange_rate\";s:7:\"41.7000\";s:7:\"country\";s:6:\"Turkey\";}i:56;a:5:{s:5:\"value\";s:3:\"ILS\";s:5:\"label\";s:20:\"Israeli Shekel (ILS)\";s:6:\"symbol\";s:3:\"₪\";s:13:\"exchange_rate\";s:6:\"3.2800\";s:7:\"country\";s:6:\"Israel\";}i:57;a:5:{s:5:\"value\";s:3:\"UAH\";s:5:\"label\";s:23:\"Ukrainian Hryvnia (UAH)\";s:6:\"symbol\";s:3:\"₴\";s:13:\"exchange_rate\";s:7:\"41.3300\";s:7:\"country\";s:7:\"Ukraine\";}i:58;a:5:{s:5:\"value\";s:3:\"BYN\";s:5:\"label\";s:22:\"Belarusian Ruble (BYN)\";s:6:\"symbol\";s:2:\"Br\";s:13:\"exchange_rate\";s:6:\"3.2300\";s:7:\"country\";s:7:\"Belarus\";}i:59;a:5:{s:5:\"value\";s:3:\"KZT\";s:5:\"label\";s:23:\"Kazakhstani Tenge (KZT)\";s:6:\"symbol\";s:3:\"₸\";s:13:\"exchange_rate\";s:8:\"544.2300\";s:7:\"country\";s:10:\"Kazakhstan\";}i:60;a:5:{s:5:\"value\";s:3:\"UZS\";s:5:\"label\";s:21:\"Uzbekistani Som (UZS)\";s:6:\"symbol\";s:4:\"лв\";s:13:\"exchange_rate\";s:10:\"12078.6900\";s:7:\"country\";s:10:\"Uzbekistan\";}i:61;a:5:{s:5:\"value\";s:3:\"KGS\";s:5:\"label\";s:21:\"Kyrgyzstani Som (KGS)\";s:6:\"symbol\";s:4:\"лв\";s:13:\"exchange_rate\";s:7:\"87.3500\";s:7:\"country\";s:10:\"Kyrgyzstan\";}i:62;a:5:{s:5:\"value\";s:3:\"TJS\";s:5:\"label\";s:24:\"Tajikistani Somoni (TJS)\";s:6:\"symbol\";s:2:\"SM\";s:13:\"exchange_rate\";s:6:\"9.3800\";s:7:\"country\";s:10:\"Tajikistan\";}i:63;a:5:{s:5:\"value\";s:3:\"TMT\";s:5:\"label\";s:25:\"Turkmenistani Manat (TMT)\";s:6:\"symbol\";s:1:\"T\";s:13:\"exchange_rate\";s:6:\"3.5000\";s:7:\"country\";s:12:\"Turkmenistan\";}i:64;a:5:{s:5:\"value\";s:3:\"AFN\";s:5:\"label\";s:20:\"Afghan Afghani (AFN)\";s:6:\"symbol\";s:2:\"؋\";s:13:\"exchange_rate\";s:7:\"67.1500\";s:7:\"country\";s:11:\"Afghanistan\";}i:65;a:5:{s:5:\"value\";s:3:\"IRR\";s:5:\"label\";s:18:\"Iranian Rial (IRR)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:10:\"42434.4900\";s:7:\"country\";s:4:\"Iran\";}i:66;a:5:{s:5:\"value\";s:3:\"IQD\";s:5:\"label\";s:17:\"Iraqi Dinar (IQD)\";s:6:\"symbol\";s:5:\"ع.د\";s:13:\"exchange_rate\";s:9:\"1309.3300\";s:7:\"country\";s:4:\"Iraq\";}i:67;a:5:{s:5:\"value\";s:3:\"SYP\";s:5:\"label\";s:18:\"Syrian Pound (SYP)\";s:6:\"symbol\";s:2:\"£\";s:13:\"exchange_rate\";s:10:\"12890.1200\";s:7:\"country\";s:5:\"Syria\";}i:68;a:5:{s:5:\"value\";s:3:\"YER\";s:5:\"label\";s:17:\"Yemeni Rial (YER)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:8:\"239.0000\";s:7:\"country\";s:5:\"Yemen\";}i:69;a:5:{s:5:\"value\";s:3:\"SOS\";s:5:\"label\";s:21:\"Somali Shilling (SOS)\";s:6:\"symbol\";s:1:\"S\";s:13:\"exchange_rate\";s:8:\"571.3000\";s:7:\"country\";s:7:\"Somalia\";}i:70;a:5:{s:5:\"value\";s:3:\"ETB\";s:5:\"label\";s:20:\"Ethiopian Birr (ETB)\";s:6:\"symbol\";s:2:\"Br\";s:13:\"exchange_rate\";s:8:\"143.9200\";s:7:\"country\";s:8:\"Ethiopia\";}i:71;a:5:{s:5:\"value\";s:3:\"TZS\";s:5:\"label\";s:24:\"Tanzanian Shilling (TZS)\";s:6:\"symbol\";s:3:\"TSh\";s:13:\"exchange_rate\";s:9:\"2445.6500\";s:7:\"country\";s:8:\"Tanzania\";}i:72;a:5:{s:5:\"value\";s:3:\"UGX\";s:5:\"label\";s:22:\"Ugandan Shilling (UGX)\";s:6:\"symbol\";s:3:\"USh\";s:13:\"exchange_rate\";s:9:\"3430.1500\";s:7:\"country\";s:6:\"Uganda\";}i:73;a:5:{s:5:\"value\";s:3:\"RWF\";s:5:\"label\";s:19:\"Rwandan Franc (RWF)\";s:6:\"symbol\";s:2:\"RF\";s:13:\"exchange_rate\";s:9:\"1452.9700\";s:7:\"country\";s:6:\"Rwanda\";}i:74;a:5:{s:5:\"value\";s:3:\"BIF\";s:5:\"label\";s:21:\"Burundian Franc (BIF)\";s:6:\"symbol\";s:3:\"FBu\";s:13:\"exchange_rate\";s:9:\"2959.3900\";s:7:\"country\";s:7:\"Burundi\";}i:75;a:5:{s:5:\"value\";s:3:\"MWK\";s:5:\"label\";s:21:\"Malawian Kwacha (MWK)\";s:6:\"symbol\";s:2:\"MK\";s:13:\"exchange_rate\";s:9:\"1743.1500\";s:7:\"country\";s:6:\"Malawi\";}i:76;a:5:{s:5:\"value\";s:3:\"ZMW\";s:5:\"label\";s:20:\"Zambian Kwacha (ZMW)\";s:6:\"symbol\";s:2:\"ZK\";s:13:\"exchange_rate\";s:7:\"23.8200\";s:7:\"country\";s:6:\"Zambia\";}i:77;a:5:{s:5:\"value\";s:3:\"BWP\";s:5:\"label\";s:19:\"Botswana Pula (BWP)\";s:6:\"symbol\";s:1:\"P\";s:13:\"exchange_rate\";s:7:\"14.1500\";s:7:\"country\";s:8:\"Botswana\";}i:78;a:5:{s:5:\"value\";s:3:\"NAD\";s:5:\"label\";s:21:\"Namibian Dollar (NAD)\";s:6:\"symbol\";s:2:\"N$\";s:13:\"exchange_rate\";s:7:\"17.2000\";s:7:\"country\";s:7:\"Namibia\";}i:79;a:5:{s:5:\"value\";s:3:\"SZL\";s:5:\"label\";s:21:\"Swazi Lilangeni (SZL)\";s:6:\"symbol\";s:1:\"L\";s:13:\"exchange_rate\";s:7:\"17.2000\";s:7:\"country\";s:8:\"Eswatini\";}i:80;a:5:{s:5:\"value\";s:3:\"LSL\";s:5:\"label\";s:18:\"Lesotho Loti (LSL)\";s:6:\"symbol\";s:1:\"L\";s:13:\"exchange_rate\";s:7:\"17.2000\";s:7:\"country\";s:7:\"Lesotho\";}i:81;a:5:{s:5:\"value\";s:3:\"MUR\";s:5:\"label\";s:21:\"Mauritian Rupee (MUR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:7:\"45.3600\";s:7:\"country\";s:9:\"Mauritius\";}i:82;a:5:{s:5:\"value\";s:3:\"SCR\";s:5:\"label\";s:23:\"Seychellois Rupee (SCR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:7:\"14.6500\";s:7:\"country\";s:10:\"Seychelles\";}i:83;a:5:{s:5:\"value\";s:3:\"MAD\";s:5:\"label\";s:21:\"Moroccan Dirham (MAD)\";s:6:\"symbol\";s:6:\"د.م.\";s:13:\"exchange_rate\";s:6:\"9.1200\";s:7:\"country\";s:7:\"Morocco\";}i:84;a:5:{s:5:\"value\";s:3:\"TND\";s:5:\"label\";s:20:\"Tunisian Dinar (TND)\";s:6:\"symbol\";s:5:\"د.ت\";s:13:\"exchange_rate\";s:6:\"2.9100\";s:7:\"country\";s:7:\"Tunisia\";}i:85;a:5:{s:5:\"value\";s:3:\"DZD\";s:5:\"label\";s:20:\"Algerian Dinar (DZD)\";s:6:\"symbol\";s:5:\"د.ج\";s:13:\"exchange_rate\";s:8:\"129.2400\";s:7:\"country\";s:7:\"Algeria\";}i:86;a:5:{s:5:\"value\";s:3:\"LYD\";s:5:\"label\";s:18:\"Libyan Dinar (LYD)\";s:6:\"symbol\";s:5:\"ل.د\";s:13:\"exchange_rate\";s:6:\"5.3900\";s:7:\"country\";s:5:\"Libya\";}i:87;a:5:{s:5:\"value\";s:3:\"SDG\";s:5:\"label\";s:20:\"Sudanese Pound (SDG)\";s:6:\"symbol\";s:6:\"ج.س.\";s:13:\"exchange_rate\";s:8:\"454.3000\";s:7:\"country\";s:5:\"Sudan\";}i:88;a:5:{s:5:\"value\";s:3:\"SSP\";s:5:\"label\";s:26:\"South Sudanese Pound (SSP)\";s:6:\"symbol\";s:2:\"£\";s:13:\"exchange_rate\";s:9:\"4722.1700\";s:7:\"country\";s:11:\"South Sudan\";}i:89;a:5:{s:5:\"value\";s:3:\"CDF\";s:5:\"label\";s:21:\"Congolese Franc (CDF)\";s:6:\"symbol\";s:2:\"FC\";s:13:\"exchange_rate\";s:9:\"2580.5500\";s:7:\"country\";s:28:\"Democratic Republic of Congo\";}i:90;a:5:{s:5:\"value\";s:3:\"XAF\";s:5:\"label\";s:31:\"Central African CFA Franc (XAF)\";s:6:\"symbol\";s:4:\"FCFA\";s:13:\"exchange_rate\";s:8:\"560.2800\";s:7:\"country\";s:24:\"Central African Republic\";}i:91;a:5:{s:5:\"value\";s:3:\"XOF\";s:5:\"label\";s:28:\"West African CFA Franc (XOF)\";s:6:\"symbol\";s:3:\"CFA\";s:13:\"exchange_rate\";s:8:\"560.2800\";s:7:\"country\";s:7:\"Senegal\";}i:92;a:5:{s:5:\"value\";s:3:\"GMD\";s:5:\"label\";s:20:\"Gambian Dalasi (GMD)\";s:6:\"symbol\";s:1:\"D\";s:13:\"exchange_rate\";s:7:\"73.4100\";s:7:\"country\";s:6:\"Gambia\";}i:93;a:5:{s:5:\"value\";s:3:\"GNF\";s:5:\"label\";s:19:\"Guinean Franc (GNF)\";s:6:\"symbol\";s:2:\"FG\";s:13:\"exchange_rate\";s:9:\"8692.7600\";s:7:\"country\";s:6:\"Guinea\";}i:94;a:5:{s:5:\"value\";s:3:\"SLL\";s:5:\"label\";s:26:\"Sierra Leonean Leone (SLL)\";s:6:\"symbol\";s:2:\"Le\";s:13:\"exchange_rate\";s:10:\"23337.0400\";s:7:\"country\";s:12:\"Sierra Leone\";}i:95;a:5:{s:5:\"value\";s:3:\"LRD\";s:5:\"label\";s:21:\"Liberian Dollar (LRD)\";s:6:\"symbol\";s:2:\"L$\";s:13:\"exchange_rate\";s:8:\"181.5600\";s:7:\"country\";s:7:\"Liberia\";}i:96;a:5:{s:5:\"value\";s:3:\"CVE\";s:5:\"label\";s:25:\"Cape Verdean Escudo (CVE)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:7:\"94.1800\";s:7:\"country\";s:10:\"Cape Verde\";}i:97;a:5:{s:5:\"value\";s:3:\"STN\";s:5:\"label\";s:36:\"São Tomé and Príncipe Dobra (STN)\";s:6:\"symbol\";s:2:\"Db\";s:13:\"exchange_rate\";s:7:\"20.9300\";s:7:\"country\";s:24:\"São Tomé and Príncipe\";}i:98;a:5:{s:5:\"value\";s:3:\"AOA\";s:5:\"label\";s:20:\"Angolan Kwanza (AOA)\";s:6:\"symbol\";s:2:\"Kz\";s:13:\"exchange_rate\";s:8:\"920.1900\";s:7:\"country\";s:6:\"Angola\";}i:99;a:5:{s:5:\"value\";s:3:\"ZWL\";s:5:\"label\";s:23:\"Zimbabwean Dollar (ZWL)\";s:6:\"symbol\";s:2:\"Z$\";s:13:\"exchange_rate\";s:7:\"26.6500\";s:7:\"country\";s:8:\"Zimbabwe\";}}', 1772402900);

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
  `account_code` varchar(15) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_type` enum('Assets','Liabilities','Equity','Revenue','Expenses') NOT NULL,
  `parent_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `account_level` tinyint(4) NOT NULL DEFAULT 1,
  `is_transactional` tinyint(1) NOT NULL DEFAULT 0,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `short_code` varchar(20) DEFAULT NULL,
  `comp_id` bigint(20) UNSIGNED DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chart_of_accounts`
--

INSERT INTO `chart_of_accounts` (`id`, `account_code`, `account_name`, `account_type`, `parent_account_id`, `account_level`, `is_transactional`, `currency`, `status`, `created_at`, `updated_at`, `short_code`, `comp_id`, `location_id`) VALUES
(1, '100000000000000', 'Assets', 'Assets', NULL, 1, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(2, '100010000000000', 'Current Assets', 'Assets', 1, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(3, '100020000000000', 'Fixed Assets', 'Assets', 1, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(4, '100030000000000', 'Intangible Assets', 'Assets', 1, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(5, '100040000000000', 'Investments', 'Assets', 1, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(6, '100050000000000', 'Other Assets', 'Assets', 1, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(7, '100010001000000', 'Cash Account / Cash In Hand', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CASH', 1, 1),
(8, '100010002000000', 'Petty Cash Account', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PETTY', 1, 1),
(9, '100010003000000', 'Bank Account', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BANK', 1, 1),
(10, '100010004000000', 'Accounts Receivable', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AR', 1, 1),
(11, '100010005000000', 'Inventory Account', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INV', 1, 1),
(12, '100010006000000', 'Prepaid Expenses', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PREP', 1, 1),
(13, '100020001000000', 'Land Account', 'Assets', 3, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LAND', 1, 1),
(14, '100020002000000', 'Building Account', 'Assets', 3, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BUILD', 1, 1),
(15, '100020003000000', 'Machinery Account', 'Assets', 3, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'MACH', 1, 1),
(16, '100020004000000', 'Furniture & Fixtures', 'Assets', 3, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FURN', 1, 1),
(17, '100020005000000', 'Vehicle Account', 'Assets', 3, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'VEH', 1, 1),
(18, '100030001000000', 'Goodwill Account', 'Assets', 4, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GOOD', 1, 1),
(19, '100030002000000', 'Software License Account', 'Assets', 4, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SOFT', 1, 1),
(20, '100030003000000', 'Patents & Trademarks', 'Assets', 4, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PAT', 1, 1),
(21, '100040001000000', 'Long-term Investment Account', 'Assets', 5, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LTI', 1, 1),
(22, '100040002000000', 'Short-term Investment Account', 'Assets', 5, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STI', 1, 1),
(23, '100050001000000', 'Deferred Tax Asset', 'Assets', 6, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DTA', 1, 1),
(24, '100050002000000', 'Security Deposits', 'Assets', 6, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SEC', 1, 1),
(25, '100050003000000', 'Employee Advances', 'Assets', 6, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'EMP', 1, 1),
(26, '100010001000001', 'Cash in Hands', 'Assets', 7, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CIH', 1, 1),
(27, '100010002000001', 'Petty Cash', 'Assets', 8, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PC', 1, 1),
(28, '100010003000001', 'HBL', 'Assets', 9, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'B-HBL', 1, 1),
(29, '100010004000001', 'Accounts Receivable', 'Assets', 10, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AR', 1, 1),
(30, '100010005000001', 'Inventory', 'Assets', 11, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INV', 1, 1),
(31, '100010006000001', 'Prepaid Expenses', 'Assets', 12, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PREP', 1, 1),
(32, '100020001000001', 'Land', 'Assets', 13, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LAND', 1, 1),
(33, '100020002000001', 'Buildings', 'Assets', 14, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BUILD', 1, 1),
(34, '100020003000001', 'Machinery', 'Assets', 15, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'MACH', 1, 1),
(35, '100020004000001', 'Furniture and Fixtures', 'Assets', 16, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FURN', 1, 1),
(36, '100020005000001', 'Vehicles', 'Assets', 17, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'VEH', 1, 1),
(37, '100030001000001', 'Goodwill', 'Assets', 18, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GOOD', 1, 1),
(38, '100030002000001', 'Software Licenses', 'Assets', 19, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SOFT', 1, 1),
(39, '100030003000001', 'Patents and Trademarks', 'Assets', 20, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PAT', 1, 1),
(40, '100040001000001', 'Long-term Investments', 'Assets', 21, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LTI', 1, 1),
(41, '100040002000001', 'Short-term Investments', 'Assets', 22, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STI', 1, 1),
(42, '100050001000001', 'Deferred Tax Asset', 'Assets', 23, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DTA', 1, 1),
(43, '100050002000001', 'Security Deposits', 'Assets', 24, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SEC', 1, 1),
(44, '100050003000001', 'Employee Advances', 'Assets', 25, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'EMP', 1, 1),
(45, '200000000000000', 'Liabilities', 'Liabilities', NULL, 1, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(46, '200010000000000', 'Current Liabilities', 'Liabilities', 45, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(47, '200020000000000', 'Long-term Liabilities', 'Liabilities', 45, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(48, '200030000000000', 'Provisions', 'Liabilities', 45, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(49, '200040000000000', 'Deferred Liabilities', 'Liabilities', 45, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(50, '200010001000000', 'Accounts Payable Account', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AP', 1, 1),
(51, '200010002000000', 'Accrued Expenses Account', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ACC', 1, 1),
(52, '200010003000000', 'Short-term Loan Account', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STL', 1, 1),
(53, '200010004000000', 'Tax Payable Account', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TAX', 1, 1),
(54, '200010005000000', 'Wages Payable Account', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'WAGE', 1, 1),
(55, '200010006000000', 'Interest Payable Account', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INT', 1, 1),
(56, '200020001000000', 'Bank Loan Account', 'Liabilities', 47, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BL', 1, 1),
(57, '200020002000000', 'Lease Obligation Account', 'Liabilities', 47, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LEASE', 1, 1),
(58, '200020003000000', 'Bond Payable Account', 'Liabilities', 47, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BOND', 1, 1),
(59, '200020004000000', 'Mortgage Payable Account', 'Liabilities', 47, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'MORT', 1, 1),
(60, '200030001000000', 'Provision for Income Tax', 'Liabilities', 48, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PROV', 1, 1),
(61, '200030002000000', 'Provision for Bonus', 'Liabilities', 48, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BONUS', 1, 1),
(62, '200030003000000', 'Provision for Gratuity', 'Liabilities', 48, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GRAT', 1, 1),
(63, '200040001000000', 'Deferred Tax Liability', 'Liabilities', 49, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DTL', 1, 1),
(64, '200040002000000', 'Deferred Revenue', 'Liabilities', 49, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DREV', 1, 1),
(65, '200010001000001', 'Accounts Payable', 'Liabilities', 50, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AP', 1, 1),
(66, '200010002000001', 'Accrued Expenses', 'Liabilities', 51, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ACC', 1, 1),
(67, '200010003000001', 'Short-term Loans', 'Liabilities', 52, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STL', 1, 1),
(68, '200010004000001', 'Taxes Payable', 'Liabilities', 53, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TAX', 1, 1),
(69, '200010005000001', 'Wages Payable', 'Liabilities', 54, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'WAGE', 1, 1),
(70, '200010006000001', 'Interest Payable', 'Liabilities', 55, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INT', 1, 1),
(71, '200020001000001', 'Bank Loans', 'Liabilities', 56, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BL', 1, 1),
(72, '200020002000001', 'Lease Obligations', 'Liabilities', 57, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LEASE', 1, 1),
(73, '200020003000001', 'Bonds Payable', 'Liabilities', 58, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BOND', 1, 1),
(74, '200020004000001', 'Mortgage Payable', 'Liabilities', 59, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'MORT', 1, 1),
(75, '200030001000001', 'Provision for Income Tax', 'Liabilities', 60, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PROV', 1, 1),
(76, '200030002000001', 'Provision for Bonus', 'Liabilities', 61, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BONUS', 1, 1),
(77, '200030003000001', 'Provision for Gratuity', 'Liabilities', 62, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GRAT', 1, 1),
(78, '200040001000001', 'Deferred Tax Liability', 'Liabilities', 63, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DTL', 1, 1),
(79, '200040002000001', 'Deferred Revenue', 'Liabilities', 64, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DREV', 1, 1),
(80, '300000000000000', 'Equity', 'Equity', NULL, 1, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(81, '300010000000000', 'Share Capital', 'Equity', 80, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(82, '300020000000000', 'Reserves and Surplus', 'Equity', 80, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(83, '300030000000000', 'Retained Earnings', 'Equity', 80, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(84, '300040000000000', 'Owner\'s / Partner\'s Capital', 'Equity', 80, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(85, '300050000000000', 'Drawings / Withdrawals', 'Equity', 80, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(86, '300060000000000', 'Other Comprehensive Income (OCI)', 'Equity', 80, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(87, '300010001000000', 'Authorized Share Capital Account', 'Equity', 81, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AUTH', 1, 1),
(88, '300010002000000', 'Issued Share Capital Account', 'Equity', 81, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ISSUE', 1, 1),
(89, '300010003000000', 'Subscribed Share Capital Account', 'Equity', 81, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SUB', 1, 1),
(90, '300010004000000', 'Paid-up Share Capital Account', 'Equity', 81, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PAID', 1, 1),
(91, '300010005000000', 'Preference Share Capital Account', 'Equity', 81, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PREF', 1, 1),
(92, '300010006000000', 'Ordinary Share Capital Account', 'Equity', 81, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ORD', 1, 1),
(93, '300010007000000', 'Treasury Share Account', 'Equity', 81, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TREAS', 1, 1),
(94, '300020001000000', 'General Reserve Account', 'Equity', 82, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GEN', 1, 1),
(95, '300020002000000', 'Capital Reserve Account', 'Equity', 82, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CAP', 1, 1),
(96, '300020003000000', 'Revaluation Reserve Account', 'Equity', 82, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'REVAL', 1, 1),
(97, '300020004000000', 'Share Premium Account', 'Equity', 82, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PREM', 1, 1),
(98, '300020005000000', 'Statutory Reserve Account', 'Equity', 82, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STAT', 1, 1),
(99, '300020006000000', 'Investment Fluctuation Reserve', 'Equity', 82, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INV', 1, 1),
(100, '300020007000000', 'Foreign Currency Translation Reserve', 'Equity', 82, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FCTR', 1, 1),
(101, '300030001000000', 'Opening Retained Earnings Account', 'Equity', 83, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OPEN', 1, 1),
(102, '300030002000000', 'Current Year Profit Account', 'Equity', 83, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CUR', 1, 1),
(103, '300030003000000', 'Prior Period Adjustments Account', 'Equity', 83, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PRIOR', 1, 1),
(104, '300030004000000', 'Transferred to Reserves Account', 'Equity', 83, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TRANS', 1, 1),
(105, '300030005000000', 'Accumulated Profits Account', 'Equity', 83, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ACCUM', 1, 1),
(106, '300040001000000', 'Owner\'s Capital Account', 'Equity', 84, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OWN', 1, 1),
(107, '300040002000000', 'Partner A Capital Account', 'Equity', 84, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PART1', 1, 1),
(108, '300040003000000', 'Partner B Capital Account', 'Equity', 84, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PART2', 1, 1),
(109, '300040004000000', 'Director Capital Account', 'Equity', 84, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DIR', 1, 1),
(110, '300040005000000', 'Proprietor Capital Account', 'Equity', 84, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PROP', 1, 1),
(111, '300050001000000', 'Owner Drawings Account', 'Equity', 85, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OWN', 1, 1),
(112, '300050002000000', 'Partner Drawings Account', 'Equity', 85, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PART', 1, 1),
(113, '300050003000000', 'Director Drawings Account', 'Equity', 85, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DIR', 1, 1),
(114, '300050004000000', 'Personal Expenses Account', 'Equity', 85, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PERS', 1, 1),
(115, '300060001000000', 'Unrealized Gain on Investments Account', 'Equity', 86, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'UGI', 1, 1),
(116, '300060002000000', 'Unrealized Loss on Investments Account', 'Equity', 86, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ULI', 1, 1),
(117, '300060003000000', 'Fair Value Adjustment Account', 'Equity', 86, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FVA', 1, 1),
(118, '300060004000000', 'Actuarial Gains/Losses on Pensions', 'Equity', 86, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ACT', 1, 1),
(119, '300060005000000', 'Currency Translation Differences', 'Equity', 86, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CTD', 1, 1),
(120, '300010001000001', 'Authorized Share Capital', 'Equity', 87, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AUTH', 1, 1),
(121, '300010002000001', 'Issued Share Capital', 'Equity', 88, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ISSUE', 1, 1),
(122, '300010003000001', 'Subscribed Share Capital', 'Equity', 89, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SUB', 1, 1),
(123, '300010004000001', 'Paid-up Share Capital', 'Equity', 90, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PAID', 1, 1),
(124, '300010005000001', 'Preference Share Capital', 'Equity', 91, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PREF', 1, 1),
(125, '300010006000001', 'Ordinary Share Capital', 'Equity', 92, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ORD', 1, 1),
(126, '300010007000001', 'Treasury Shares', 'Equity', 93, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TREAS', 1, 1),
(127, '300020001000001', 'General Reserve', 'Equity', 94, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GEN', 1, 1),
(128, '300020002000001', 'Capital Reserve', 'Equity', 95, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CAP', 1, 1),
(129, '300020003000001', 'Revaluation Reserve', 'Equity', 96, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'REVAL', 1, 1),
(130, '300020004000001', 'Share Premium Account', 'Equity', 97, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PREM', 1, 1),
(131, '300020005000001', 'Statutory Reserve', 'Equity', 98, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STAT', 1, 1),
(132, '300020006000001', 'Investment Fluctuation Reserve', 'Equity', 99, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INV', 1, 1),
(133, '300020007000001', 'Foreign Currency Translation Reserve', 'Equity', 100, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FCTR', 1, 1),
(134, '300030001000001', 'Opening Retained Earnings', 'Equity', 101, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OPEN', 1, 1),
(135, '300030002000001', 'Current Year Profit', 'Equity', 102, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CUR', 1, 1),
(136, '300030003000001', 'Prior Period Adjustments', 'Equity', 103, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PRIOR', 1, 1),
(137, '300030004000001', 'Transferred to Reserves', 'Equity', 104, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TRANS', 1, 1),
(138, '300030005000001', 'Accumulated Profits', 'Equity', 105, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ACCUM', 1, 1),
(139, '300040001000001', 'Owner\'s Capital Account', 'Equity', 106, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OWN', 1, 1),
(140, '300040002000001', 'Partner A Capital Account', 'Equity', 107, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PART1', 1, 1),
(141, '300040003000001', 'Partner B Capital Account', 'Equity', 108, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PART2', 1, 1),
(142, '300040004000001', 'Director Capital Account', 'Equity', 109, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DIR', 1, 1),
(143, '300040005000001', 'Proprietor Capital Account', 'Equity', 110, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PROP', 1, 1),
(144, '300050001000001', 'Owner Drawings', 'Equity', 111, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OWN', 1, 1),
(145, '300050002000001', 'Partner Drawings', 'Equity', 112, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PART', 1, 1),
(146, '300050003000001', 'Director Drawings', 'Equity', 113, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DIR', 1, 1),
(147, '300050004000001', 'Personal Expenses (Non-Business)', 'Equity', 114, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PERS', 1, 1),
(148, '300060001000001', 'Unrealized Gain on Investments', 'Equity', 115, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'UGI', 1, 1),
(149, '300060002000001', 'Unrealized Loss on Investments', 'Equity', 116, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ULI', 1, 1),
(150, '300060003000001', 'Fair Value Adjustment', 'Equity', 117, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FVA', 1, 1),
(151, '300060004000001', 'Actuarial Gains / Losses on Pensions', 'Equity', 118, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ACT', 1, 1),
(152, '300060005000001', 'Currency Translation Differences (OCI)', 'Equity', 119, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CTD', 1, 1),
(153, '400000000000000', 'Revenue', 'Revenue', NULL, 1, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(154, '400010000000000', 'Operating Revenue', 'Revenue', 153, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(155, '400020000000000', 'Non-Operating Revenue', 'Revenue', 153, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(156, '400030000000000', 'Other Income', 'Revenue', 153, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(157, '400040000000000', 'Discounts & Rebates', 'Revenue', 153, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(158, '400010001000000', 'Sales Revenue Account', 'Revenue', 154, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SALES', 1, 1),
(159, '400010002000000', 'Service Revenue Account', 'Revenue', 154, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SERV', 1, 1),
(160, '400010003000000', 'Product Revenue Account', 'Revenue', 154, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PROD', 1, 1),
(161, '400010004000000', 'Rental Income Account', 'Revenue', 154, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'RENT', 1, 1),
(162, '400010005000000', 'Maintenance Revenue Account', 'Revenue', 154, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'MAINT', 1, 1),
(163, '400010006000000', 'Subscription Revenue Account', 'Revenue', 154, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SUB', 1, 1),
(164, '400010007000000', 'Commission Income Account', 'Revenue', 154, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'COMM', 1, 1),
(165, '400010008000000', 'Consultancy Income Account', 'Revenue', 154, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CONS', 1, 1),
(166, '400020001000000', 'Interest Income Account', 'Revenue', 155, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INT', 1, 1),
(167, '400020002000000', 'Dividend Income Account', 'Revenue', 155, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DIV', 1, 1),
(168, '400020003000000', 'Gain on Sale of Assets Account', 'Revenue', 155, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GAIN', 1, 1),
(169, '400020004000000', 'Foreign Exchange Gain Account', 'Revenue', 155, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FX', 1, 1),
(170, '400020005000000', 'Investment Income Account', 'Revenue', 155, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INV', 1, 1),
(171, '400020006000000', 'Royalty Income Account', 'Revenue', 155, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ROY', 1, 1),
(172, '400030001000000', 'Miscellaneous Income Account', 'Revenue', 156, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'MISC', 1, 1),
(173, '400030002000000', 'Scrap Sales Account', 'Revenue', 156, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SCRAP', 1, 1),
(174, '400030003000000', 'Insurance Claim Received Account', 'Revenue', 156, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INS', 1, 1),
(175, '400030004000000', 'Rebate Received Account', 'Revenue', 156, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'REB', 1, 1),
(176, '400030005000000', 'Refunds & Adjustments Account', 'Revenue', 156, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'REF', 1, 1),
(177, '400030006000000', 'Grant Income Account', 'Revenue', 156, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GRANT', 1, 1),
(178, '400040001000000', 'Sales Discounts Account', 'Revenue', 157, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DISC', 1, 1),
(179, '400040002000000', 'Early Payment Discounts Account', 'Revenue', 157, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'EPD', 1, 1),
(180, '400040003000000', 'Customer Rebates Account', 'Revenue', 157, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CR', 1, 1),
(181, '400040004000000', 'Trade Discounts Account', 'Revenue', 157, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TD', 1, 1),
(182, '400040005000000', 'Loyalty Program Discounts Account', 'Revenue', 157, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LPD', 1, 1),
(183, '400010001000001', 'Sales Revenue', 'Revenue', 158, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SALES', 1, 1),
(184, '400010002000001', 'Service Revenue', 'Revenue', 159, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SERV', 1, 1),
(185, '400010003000001', 'Product Revenue', 'Revenue', 160, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PROD', 1, 1),
(186, '400010004000001', 'Rental Income', 'Revenue', 161, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'RENT', 1, 1),
(187, '400010005000001', 'Maintenance Revenue', 'Revenue', 162, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'MAINT', 1, 1),
(188, '400010006000001', 'Subscription Revenue', 'Revenue', 163, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SUB', 1, 1),
(189, '400010007000001', 'Commission Income', 'Revenue', 164, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'COMM', 1, 1),
(190, '400010008000001', 'Consultancy Income', 'Revenue', 165, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CONS', 1, 1),
(191, '400020001000001', 'Interest Income', 'Revenue', 166, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INT', 1, 1),
(192, '400020002000001', 'Dividend Income', 'Revenue', 167, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DIV', 1, 1),
(193, '400020003000001', 'Gain on Sale of Assets', 'Revenue', 168, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GAIN', 1, 1),
(194, '400020004000001', 'Foreign Exchange Gain', 'Revenue', 169, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FX', 1, 1),
(195, '400020005000001', 'Investment Income', 'Revenue', 170, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INV', 1, 1),
(196, '400020006000001', 'Royalty Income', 'Revenue', 171, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ROY', 1, 1),
(197, '400030001000001', 'Miscellaneous Income', 'Revenue', 172, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'MISC', 1, 1),
(198, '400030002000001', 'Scrap Sales', 'Revenue', 173, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SCRAP', 1, 1),
(199, '400030003000001', 'Insurance Claim Received', 'Revenue', 174, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'INS', 1, 1),
(200, '400030004000001', 'Rebate Received', 'Revenue', 175, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'REB', 1, 1),
(201, '400030005000001', 'Refunds & Adjustments', 'Revenue', 176, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'REF', 1, 1),
(202, '400030006000001', 'Grant Income', 'Revenue', 177, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GRANT', 1, 1),
(203, '400040001000001', 'Sales Discounts', 'Revenue', 178, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DISC', 1, 1),
(204, '400040002000001', 'Early Payment Discounts', 'Revenue', 179, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'EPD', 1, 1),
(205, '400040003000001', 'Customer Rebates', 'Revenue', 180, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CR', 1, 1),
(206, '400040004000001', 'Trade Discounts', 'Revenue', 181, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TD', 1, 1),
(207, '400040005000001', 'Loyalty Program Discounts', 'Revenue', 182, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LPD', 1, 1),
(208, '500000000000000', 'Expenses', 'Expenses', NULL, 1, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(209, '500010000000000', 'Cost of Goods Sold', 'Expenses', 208, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(210, '500020000000000', 'Administrative Expenses', 'Expenses', 208, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(211, '500030000000000', 'Selling & Distribution Expenses', 'Expenses', 208, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(212, '500040000000000', 'Financial Expenses', 'Expenses', 208, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(213, '500050000000000', 'Other Expenses', 'Expenses', 208, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(214, '500010001000000', 'Raw Material Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'RAW', 1, 1),
(215, '500010002000000', 'Purchase Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PUR', 1, 1),
(216, '500010003000000', 'Purchase Returns Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PR', 1, 1),
(217, '500010004000000', 'Freight Inward Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FR', 1, 1),
(218, '500010005000000', 'Packing Materials Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PACK', 1, 1),
(219, '500010006000000', 'Factory Wages Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FW', 1, 1),
(220, '500010007000000', 'Factory Rent Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FR', 1, 1),
(221, '500010008000000', 'Depreciation - Factory Equipment Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DFE', 1, 1),
(222, '500010009000000', 'Power and Fuel Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PF', 1, 1),
(223, '500010010000000', 'Direct Labor Account', 'Expenses', 209, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DL', 1, 1),
(224, '500020001000000', 'Office Salaries Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OS', 1, 1),
(225, '500020002000000', 'Office Rent Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OR', 1, 1),
(226, '500020003000000', 'Utilities Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'UTIL', 1, 1),
(227, '500020004000000', 'Stationery & Office Supplies Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STN', 1, 1),
(228, '500020005000000', 'Printing & Postage Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PP', 1, 1),
(229, '500020006000000', 'IT & Internet Expenses Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'IT', 1, 1),
(230, '500020007000000', 'Repairs & Maintenance Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'RM', 1, 1),
(231, '500020008000000', 'Depreciation - Office Equipment Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DOE', 1, 1),
(232, '500020009000000', 'Professional Fees Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PF', 1, 1),
(233, '500020010000000', 'Travel & Conveyance Account', 'Expenses', 210, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TC', 1, 1),
(234, '500030001000000', 'Advertising & Promotion Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AP', 1, 1),
(235, '500030002000000', 'Sales Commission Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SC', 1, 1),
(236, '500030003000000', 'Freight Outward Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FO', 1, 1),
(237, '500030004000000', 'Delivery & Transportation Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DT', 1, 1),
(238, '500030005000000', 'Sales Staff Salaries Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SSS', 1, 1),
(239, '500030006000000', 'Showroom Expenses Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SE', 1, 1),
(240, '500030007000000', 'Discount Allowed Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DA', 1, 1),
(241, '500030008000000', 'Promotional Samples Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PS', 1, 1),
(242, '500030009000000', 'After-Sales Service Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ASS', 1, 1),
(243, '500030010000000', 'Trade Show Expenses Account', 'Expenses', 211, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TSE', 1, 1),
(244, '500040001000000', 'Bank Charges Account', 'Expenses', 212, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BC', 1, 1),
(245, '500040002000000', 'Interest Expense Account', 'Expenses', 212, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'IE', 1, 1),
(246, '500040003000000', 'Loan Processing Fees Account', 'Expenses', 212, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LPF', 1, 1),
(247, '500040004000000', 'Foreign Exchange Loss Account', 'Expenses', 212, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FEL', 1, 1),
(248, '500040005000000', 'Credit Card Fees Account', 'Expenses', 212, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CCF', 1, 1),
(249, '500040006000000', 'Bank Overdraft Interest Account', 'Expenses', 212, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BOI', 1, 1),
(250, '500050001000000', 'Bad Debts Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BD', 1, 1),
(251, '500050002000000', 'Depreciation - Other Assets Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DOA', 1, 1),
(252, '500050003000000', 'Amortization Expense Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AE', 1, 1),
(253, '500050004000000', 'Loss on Sale of Assets Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LSA', 1, 1),
(254, '500050005000000', 'Donations & Contributions Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DC', 1, 1),
(255, '500050006000000', 'Penalties & Fines Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PF', 1, 1),
(256, '500050007000000', 'Staff Welfare Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SW', 1, 1),
(257, '500050008000000', 'Training & Seminars Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TS', 1, 1),
(258, '500050009000000', 'Miscellaneous Expenses Account', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ME', 1, 1),
(259, '500010001000001', 'Raw Material Consumed', 'Expenses', 214, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'RAW', 1, 1),
(260, '500010002000001', 'Purchases', 'Expenses', 215, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PUR', 1, 1),
(261, '500010003000001', 'Purchase Returns', 'Expenses', 216, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PR', 1, 1),
(262, '500010004000001', 'Freight Inward', 'Expenses', 217, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FR', 1, 1),
(263, '500010005000001', 'Packing Materials', 'Expenses', 218, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PACK', 1, 1),
(264, '500010006000001', 'Factory Wages', 'Expenses', 219, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FW', 1, 1),
(265, '500010007000001', 'Factory Rent', 'Expenses', 220, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FR', 1, 1),
(266, '500010008000001', 'Depreciation - Factory Equipment', 'Expenses', 221, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DFE', 1, 1),
(267, '500010009000001', 'Power and Fuel', 'Expenses', 222, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PF', 1, 1),
(268, '500010010000001', 'Direct Labor', 'Expenses', 223, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DL', 1, 1),
(269, '500020001000001', 'Office Salaries', 'Expenses', 224, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OS', 1, 1),
(270, '500020002000001', 'Office Rent', 'Expenses', 225, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OR', 1, 1),
(271, '500020003000001', 'Utilities', 'Expenses', 226, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'UTIL', 1, 1),
(272, '500020004000001', 'Stationery & Office Supplies', 'Expenses', 227, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STN', 1, 1),
(273, '500020005000001', 'Printing & Postage', 'Expenses', 228, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PP', 1, 1),
(274, '500020006000001', 'IT & Internet Expenses', 'Expenses', 229, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'IT', 1, 1),
(275, '500020007000001', 'Repairs & Maintenance', 'Expenses', 230, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'RM', 1, 1),
(276, '500020008000001', 'Depreciation - Office Equipment', 'Expenses', 231, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DOE', 1, 1),
(277, '500020009000001', 'Professional Fees', 'Expenses', 232, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PF', 1, 1),
(278, '500020010000001', 'Travel & Conveyance', 'Expenses', 233, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TC', 1, 1),
(279, '500030001000001', 'Advertising & Promotion', 'Expenses', 234, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ADV', 1, 1),
(280, '500030002000001', 'Sales Commission', 'Expenses', 235, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SC', 1, 1),
(281, '500030003000001', 'Freight Outward', 'Expenses', 236, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FO', 1, 1),
(282, '500030004000001', 'Delivery & Transportation', 'Expenses', 237, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DT', 1, 1),
(283, '500030005000001', 'Sales Staff Salaries', 'Expenses', 238, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SSS', 1, 1),
(284, '500030006000001', 'Showroom Expenses', 'Expenses', 239, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SE', 1, 1),
(285, '500030007000001', 'Discount Allowed', 'Expenses', 240, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DA', 1, 1),
(286, '500030008000001', 'Promotional Samples', 'Expenses', 241, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PS', 1, 1),
(287, '500030009000001', 'After-Sales Service', 'Expenses', 242, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ASS', 1, 1),
(288, '500030010000001', 'Trade Show Expenses', 'Expenses', 243, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'TSE', 1, 1),
(289, '500040001000001', 'Bank Charges', 'Expenses', 244, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BC', 1, 1),
(290, '500040002000001', 'Interest Expense', 'Expenses', 245, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'IE', 1, 1),
(291, '500040003000001', 'Loan Processing Fees', 'Expenses', 246, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LPF', 1, 1),
(292, '500040004000001', 'Foreign Exchange Loss', 'Expenses', 247, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FXL', 1, 1),
(293, '500040005000001', 'Credit Card Fees', 'Expenses', 248, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CCF', 1, 1),
(294, '500040006000001', 'Bank Overdraft Interest', 'Expenses', 249, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BOI', 1, 1),
(295, '500050001000001', 'Bad Debts', 'Expenses', 250, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'BD', 1, 1),
(296, '500050002000001', 'Depreciation - Other Assets', 'Expenses', 251, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DOA', 1, 1),
(297, '500050003000001', 'Amortization Expense', 'Expenses', 252, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AE', 1, 1),
(298, '500050004000001', 'Loss on Sale of Assets', 'Expenses', 253, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LSA', 1, 1),
(299, '500050005000001', 'Donations & Contributions', 'Expenses', 254, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DC', 1, 1),
(300, '500050006000001', 'Penalties & Fines', 'Expenses', 255, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'PF', 1, 1),
(301, '100010007000000', 'Trade Receivables / Debtors', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DEB', 1, 1),
(302, '100010008000000', 'Other Debtors', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ODEB', 1, 1),
(303, '100010009000000', 'Allowance for Doubtful Debts', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ADD', 1, 1),
(304, '100010007000001', 'Trade Receivables', 'Assets', 301, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DEB', 1, 1),
(305, '100010008000001', 'Other Debtors', 'Assets', 302, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ODEB', 1, 1),
(306, '100010009000001', 'Allowance for Doubtful Debts Reserve', 'Assets', 303, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ADD', 1, 1),
(307, '100010010000000', 'Income Tax Receivable', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ITR', 1, 1),
(308, '100010011000000', 'GST / VAT Receivable', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GSTR', 1, 1),
(309, '100010012000000', 'Sales Tax Receivable', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SATR', 1, 1),
(310, '100010010000001', 'Income Tax Receivable', 'Assets', 307, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ITR', 1, 1),
(311, '100010011000001', 'GST / VAT Receivable', 'Assets', 308, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GSTR', 1, 1),
(312, '100010012000001', 'Sales Tax Receivable', 'Assets', 309, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SATR', 1, 1),
(313, '100010013000000', 'Loan Receivable', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LR', 1, 1),
(314, '100010014000000', 'Lease Receivable', 'Assets', 2, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LEAR', 1, 1),
(315, '100010013000001', 'Loan Receivable', 'Assets', 313, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LR', 1, 1),
(316, '100010014000001', 'Lease Receivable', 'Assets', 314, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LEAR', 1, 1),
(317, '100020006000000', 'Right-of-Use Assets', 'Assets', 3, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ROU', 1, 1),
(318, '100020006000001', 'Right-of-Use Assets - Leased Property', 'Assets', 317, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ROULP', 1, 1),
(319, '100020007000000', 'Accumulated Depreciation - ROU', 'Assets', 3, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ADROU', 1, 1),
(320, '100020007000001', 'Accumulated Depreciation - ROU Assets', 'Assets', 319, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ADROU', 1, 1),
(321, '100050004000000', 'Stock Investments / Equity Shares', 'Assets', 6, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'STOCK', 1, 1),
(322, '100050004000001', 'Investment in Shares', 'Assets', 321, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SHARES', 1, 1),
(323, '100050005000000', 'Assets Held for Sale', 'Assets', 6, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AHS', 1, 1),
(324, '100050005000001', 'Assets Held for Sale', 'Assets', 323, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'AHS', 1, 1),
(325, '200010007000000', 'Trade Payables / Creditors', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CRED', 1, 1),
(326, '200010008000000', 'Other Creditors', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OCRED', 1, 1),
(327, '200010007000001', 'Trade Payables', 'Liabilities', 325, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CRED', 1, 1),
(328, '200010008000001', 'Other Creditors', 'Liabilities', 326, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'OCRED', 1, 1),
(329, '200010009000000', 'Income Tax Payable', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ITP', 1, 1),
(330, '200010010000000', 'GST / VAT Payable', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GSTP', 1, 1),
(331, '200010011000000', 'Sales Tax Payable', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SATP', 1, 1),
(332, '200010009000001', 'Income Tax Payable', 'Liabilities', 329, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ITP', 1, 1),
(333, '200010010000001', 'GST / VAT Payable', 'Liabilities', 330, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'GSTP', 1, 1),
(334, '200010011000001', 'Sales Tax Payable', 'Liabilities', 331, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'SATP', 1, 1),
(335, '200010012000000', 'Accrued Salaries Payable', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ASALP', 1, 1),
(336, '200010013000000', 'Accrued Leave Liability', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ALL', 1, 1),
(337, '200010014000000', 'Employee Benefits Receivable', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'EBR', 1, 1),
(338, '200010012000001', 'Accrued Salaries Payable', 'Liabilities', 335, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ASALP', 1, 1);
INSERT INTO `chart_of_accounts` (`id`, `account_code`, `account_name`, `account_type`, `parent_account_id`, `account_level`, `is_transactional`, `currency`, `status`, `created_at`, `updated_at`, `short_code`, `comp_id`, `location_id`) VALUES
(339, '200010013000001', 'Accrued Leave Liability', 'Liabilities', 336, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ALL', 1, 1),
(340, '200010014000001', 'Employee Benefits Receivable', 'Liabilities', 337, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'EBR', 1, 1),
(341, '200010015000000', 'Advance from Customers', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ADVC', 1, 1),
(342, '200010015000001', 'Advance from Customers', 'Liabilities', 341, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ADVC', 1, 1),
(343, '200010016000000', 'Current Portion of Long-term Debt', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CPLD', 1, 1),
(344, '200010016000001', 'Current Portion of Long-term Debt', 'Liabilities', 343, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CPLD', 1, 1),
(345, '200020005000000', 'Lease Liability - Current', 'Liabilities', 46, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LLC', 1, 1),
(346, '200020006000000', 'Lease Liability - Non-Current', 'Liabilities', 47, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LLNC', 1, 1),
(347, '200020005000001', 'Lease Liability - Current', 'Liabilities', 345, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LLC', 1, 1),
(348, '200020006000001', 'Lease Liability - Non-Current', 'Liabilities', 346, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LLNC', 1, 1),
(349, '200030004000000', 'Employee Severance Obligation', 'Liabilities', 48, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ESO', 1, 1),
(350, '200030005000000', 'Pension Obligation', 'Liabilities', 48, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'POBS', 1, 1),
(351, '200030004000001', 'Employee Severance Obligation', 'Liabilities', 349, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'ESO', 1, 1),
(352, '200030005000001', 'Pension Obligation', 'Liabilities', 350, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'POBS', 1, 1),
(353, '500060000000000', 'Tax Expense', 'Expenses', 208, 2, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', NULL, 1, 1),
(354, '500060001000000', 'Current Tax Expense', 'Expenses', 353, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CTE', 1, 1),
(355, '500060002000000', 'Deferred Tax Expense', 'Expenses', 353, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DTE', 1, 1),
(356, '500060001000001', 'Current Tax Expense', 'Expenses', 354, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'CTE', 1, 1),
(357, '500060002000001', 'Deferred Tax Expense', 'Expenses', 355, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'DTE', 1, 1),
(358, '500050010000000', 'Impairment Loss - Goodwill', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'IMG', 1, 1),
(359, '500050011000000', 'Impairment Loss - Receivables', 'Expenses', 213, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'IMR', 1, 1),
(360, '500050010000001', 'Impairment Loss - Goodwill', 'Expenses', 358, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'IMG', 1, 1),
(361, '500050011000001', 'Impairment Loss - Receivables', 'Expenses', 359, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'IMR', 1, 1),
(362, '500040007000000', 'Lease Interest Expense', 'Expenses', 212, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LIE', 1, 1),
(363, '500040008000000', 'Finance Lease Interest', 'Expenses', 212, 3, 0, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FLI', 1, 1),
(364, '500040007000001', 'Lease Interest Expense', 'Expenses', 362, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'LIE', 1, 1),
(365, '500040008000001', 'Finance Lease Interest', 'Expenses', 363, 4, 1, 'USD', 'Active', '2025-10-14 05:12:21', '2025-10-14 05:12:21', 'FLI', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `code_configurations`
--

CREATE TABLE `code_configurations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED DEFAULT NULL,
  `level2_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `level3_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `code_type` varchar(50) NOT NULL,
  `code_name` varchar(100) DEFAULT NULL,
  `account_level` int(11) DEFAULT NULL,
  `prefix` varchar(10) DEFAULT NULL,
  `next_number` int(11) DEFAULT NULL,
  `number_length` int(11) DEFAULT NULL,
  `separator` varchar(5) NOT NULL DEFAULT '-',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `parent_comp` varchar(3) DEFAULT NULL,
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
  `attachment_storage_limit_mb` int(11) NOT NULL DEFAULT 1000 COMMENT 'Storage limit for attachments in MB',
  `brand_color_primary` varchar(7) NOT NULL DEFAULT '#3B82F6',
  `brand_color_secondary` varchar(7) NOT NULL DEFAULT '#64748B',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `auto_voucher_numbering` tinyint(1) NOT NULL DEFAULT 1,
  `accounting_vno_auto` tinyint(1) NOT NULL DEFAULT 1,
  `base_currency` varchar(3) NOT NULL DEFAULT 'USD',
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

INSERT INTO `companies` (`id`, `parent_comp`, `company_name`, `company_code`, `legal_name`, `trading_name`, `registration_number`, `tax_id`, `vat_number`, `incorporation_date`, `company_type`, `email`, `phone`, `fax`, `website`, `address_line_1`, `address_line_2`, `city`, `state_province`, `postal_code`, `country`, `timezone`, `industry`, `business_description`, `employee_count`, `annual_revenue`, `currency`, `fiscal_year_start`, `license_number`, `license_expiry`, `compliance_certifications`, `legal_notes`, `bank_name`, `bank_account_number`, `bank_routing_number`, `swift_code`, `iban`, `logo`, `attachment_storage_limit_mb`, `brand_color_primary`, `brand_color_secondary`, `status`, `auto_voucher_numbering`, `accounting_vno_auto`, `base_currency`, `settings`, `features`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `package_id`, `license_start_date`, `license_end_date`) VALUES
(1, 'Yes', 'Acme Corporation', 'ACME001', NULL, NULL, 'REG001', NULL, NULL, NULL, 'private_limited', 'contact@acme.com', NULL, NULL, NULL, '123 Main Street', NULL, 'New York', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'PKR', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000, '#3B82F6', '#64748B', 1, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-10-06 21:56:28', NULL, 3, '2025-10-01', '2026-10-01'),
(2, 'No', 'Tech Solutions Inc', 'TECH001', NULL, NULL, 'REG002', NULL, NULL, NULL, 'private_limited', 'info@techsolutions.com', NULL, NULL, NULL, '456 Tech Avenue', NULL, 'San Francisco', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000, '#3B82F6', '#64748B', 1, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(3, 'No', 'Global Industries Ltd', 'GLOBAL001', NULL, NULL, 'REG003', NULL, NULL, NULL, 'private_limited', 'contact@globalindustries.com', NULL, NULL, NULL, '789 Business District', NULL, 'London', NULL, NULL, 'United Kingdom', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000, '#3B82F6', '#64748B', 1, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(4, 'No', 'Innovation Hub', 'INNOV001', NULL, NULL, 'REG004', NULL, NULL, NULL, 'private_limited', 'hello@innovationhub.com', NULL, NULL, NULL, '321 Innovation Street', NULL, 'Boston', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000, '#3B82F6', '#64748B', 1, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(5, 'No', 'Enterprise Systems', 'ENT001', NULL, NULL, 'REG005', NULL, NULL, NULL, 'private_limited', 'contact@enterprisesystems.com', NULL, NULL, NULL, '654 Corporate Plaza', NULL, 'Chicago', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000, '#3B82F6', '#64748B', 0, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL);

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
(1, 'USD', 'United States Dollarss', '$', 'United States', 1.0000, 1, 1, 1, '2025-10-06 21:42:59', '2025-10-06 21:42:59'),
(2, 'EUR', 'Euro', '€', 'European Union', 0.8540, 1, 0, 2, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(3, 'GBP', 'British Pound Sterling', '£', 'United Kingdom', 0.7420, 1, 0, 3, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(4, 'JPY', 'Japanese Yen', '¥', 'Japan', 150.0200, 1, 0, 4, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(5, 'CHF', 'Swiss Franc', 'CHF', 'Switzerland', 0.7960, 1, 0, 5, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(6, 'CAD', 'Canadian Dollar', 'C$', 'Canada', 1.4000, 1, 0, 6, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(7, 'AUD', 'Australian Dollar', 'A$', 'Australia', 1.5100, 1, 0, 7, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(8, 'NZD', 'New Zealand Dollar', 'NZ$', 'New Zealand', 1.7100, 1, 0, 8, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(9, 'CNY', 'Chinese Yuan', '¥', 'China', 7.1300, 1, 0, 9, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(10, 'HKD', 'Hong Kong Dollar', 'HK$', 'Hong Kong', 7.7800, 1, 0, 10, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(11, 'SGD', 'Singapore Dollar', 'S$', 'Singapore', 1.2900, 1, 0, 11, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(12, 'KRW', 'South Korean Won', '₩', 'South Korea', 1410.7200, 1, 0, 12, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(13, 'INR', 'Indian Rupee', '₹', 'India', 88.7800, 1, 0, 13, '2025-10-06 21:42:59', '2025-10-06 21:51:55'),
(14, 'PKR', 'Pakistani Rupee', '₨', 'Pakistan', 283.2500, 1, 0, 14, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(15, 'BDT', 'Bangladeshi Taka', '৳', 'Bangladesh', 121.7500, 1, 0, 15, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(16, 'LKR', 'Sri Lankan Rupee', '₨', 'Sri Lanka', 302.3200, 1, 0, 16, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(17, 'NPR', 'Nepalese Rupee', '₨', 'Nepal', 142.0500, 1, 0, 17, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(18, 'THB', 'Thai Baht', '฿', 'Thailand', 32.4200, 1, 0, 18, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(19, 'MYR', 'Malaysian Ringgit', 'RM', 'Malaysia', 4.2100, 1, 0, 19, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(20, 'IDR', 'Indonesian Rupiah', 'Rp', 'Indonesia', 16600.5900, 1, 0, 20, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(21, 'PHP', 'Philippine Peso', '₱', 'Philippines', 58.2800, 1, 0, 21, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(22, 'VND', 'Vietnamese Dong', '₫', 'Vietnam', 26245.6700, 1, 0, 22, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(23, 'AED', 'UAE Dirham', 'د.إ', 'United Arab Emirates', 3.6700, 1, 0, 23, '2025-10-06 21:42:59', '2025-10-06 21:42:59'),
(24, 'SAR', 'Saudi Riyal', '﷼', 'Saudi Arabia', 3.7500, 1, 0, 24, '2025-10-06 21:42:59', '2025-10-06 21:42:59'),
(25, 'QAR', 'Qatari Riyal', '﷼', 'Qatar', 3.6400, 1, 0, 25, '2025-10-06 21:42:59', '2025-10-06 21:42:59'),
(26, 'KWD', 'Kuwaiti Dinar', 'د.ك', 'Kuwait', 0.3060, 1, 0, 26, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(27, 'BHD', 'Bahraini Dinar', 'د.ب', 'Bahrain', 0.3760, 1, 0, 27, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(28, 'OMR', 'Omani Rial', '﷼', 'Oman', 0.3840, 1, 0, 28, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(29, 'JOD', 'Jordanian Dinar', 'د.ا', 'Jordan', 0.7090, 1, 0, 29, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(30, 'LBP', 'Lebanese Pound', 'ل.ل', 'Lebanon', 89500.0000, 1, 0, 30, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(31, 'EGP', 'Egyptian Pound', '£', 'Egypt', 47.6100, 1, 0, 31, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(32, 'ZAR', 'South African Rand', 'R', 'South Africa', 17.2000, 1, 0, 32, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(33, 'NGN', 'Nigerian Naira', '₦', 'Nigeria', 1463.5500, 1, 0, 33, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(34, 'KES', 'Kenyan Shilling', 'KSh', 'Kenya', 129.1100, 1, 0, 34, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(35, 'GHS', 'Ghanaian Cedi', '₵', 'Ghana', 12.6100, 1, 0, 35, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(36, 'SEK', 'Swedish Krona', 'kr', 'Sweden', 9.3800, 1, 0, 36, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(37, 'NOK', 'Norwegian Krone', 'kr', 'Norway', 9.9300, 1, 0, 37, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(38, 'DKK', 'Danish Krone', 'kr', 'Denmark', 6.3700, 1, 0, 38, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(39, 'PLN', 'Polish Zloty', 'zł', 'Poland', 3.6300, 1, 0, 39, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(40, 'CZK', 'Czech Koruna', 'Kč', 'Czech Republic', 20.7800, 1, 0, 40, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(41, 'HUF', 'Hungarian Forint', 'Ft', 'Hungary', 332.0100, 1, 0, 41, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(42, 'RON', 'Romanian Leu', 'lei', 'Romania', 4.3500, 1, 0, 42, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(43, 'BGN', 'Bulgarian Lev', 'лв', 'Bulgaria', 1.6700, 1, 0, 43, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(44, 'HRK', 'Croatian Kuna', 'kn', 'Croatia', 6.4400, 1, 0, 44, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(45, 'RSD', 'Serbian Dinar', 'дин', 'Serbia', 100.1100, 1, 0, 45, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(46, 'BRL', 'Brazilian Real', 'R$', 'Brazil', 5.3400, 1, 0, 46, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(47, 'MXN', 'Mexican Peso', '$', 'Mexico', 18.3700, 1, 0, 47, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(48, 'ARS', 'Argentine Peso', '$', 'Argentina', 1429.7500, 1, 0, 48, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(49, 'CLP', 'Chilean Peso', '$', 'Chile', 963.9800, 1, 0, 49, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(50, 'COP', 'Colombian Peso', '$', 'Colombia', 3867.9200, 1, 0, 50, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(51, 'PEN', 'Peruvian Sol', 'S/', 'Peru', 3.4600, 1, 0, 51, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(52, 'UYU', 'Uruguayan Peso', '$U', 'Uruguay', 39.9200, 1, 0, 52, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(53, 'BOB', 'Bolivian Boliviano', 'Bs', 'Bolivia', 6.9200, 1, 0, 53, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(56, 'VES', 'Venezuelan Bolívar', 'Bs.S', 'Venezuela', 187.2900, 1, 0, 54, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(57, 'RUB', 'Russian Ruble', '₽', 'Russia', 82.8900, 1, 0, 55, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(58, 'TRY', 'Turkish Lira', '₺', 'Turkey', 41.7000, 1, 0, 56, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(59, 'ILS', 'Israeli Shekel', '₪', 'Israel', 3.2800, 1, 0, 57, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(60, 'UAH', 'Ukrainian Hryvnia', '₴', 'Ukraine', 41.3300, 1, 0, 58, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(61, 'BYN', 'Belarusian Ruble', 'Br', 'Belarus', 3.2300, 1, 0, 59, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(62, 'KZT', 'Kazakhstani Tenge', '₸', 'Kazakhstan', 544.2300, 1, 0, 60, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(63, 'UZS', 'Uzbekistani Som', 'лв', 'Uzbekistan', 12078.6900, 1, 0, 61, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(64, 'KGS', 'Kyrgyzstani Som', 'лв', 'Kyrgyzstan', 87.3500, 1, 0, 62, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(65, 'TJS', 'Tajikistani Somoni', 'SM', 'Tajikistan', 9.3800, 1, 0, 63, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(66, 'TMT', 'Turkmenistani Manat', 'T', 'Turkmenistan', 3.5000, 1, 0, 64, '2025-10-06 21:42:59', '2025-10-06 21:42:59'),
(67, 'AFN', 'Afghan Afghani', '؋', 'Afghanistan', 67.1500, 1, 0, 65, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(68, 'IRR', 'Iranian Rial', '﷼', 'Iran', 42434.4900, 1, 0, 66, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(69, 'IQD', 'Iraqi Dinar', 'ع.د', 'Iraq', 1309.3300, 1, 0, 67, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(70, 'SYP', 'Syrian Pound', '£', 'Syria', 12890.1200, 1, 0, 68, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(71, 'YER', 'Yemeni Rial', '﷼', 'Yemen', 239.0000, 1, 0, 69, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(72, 'SOS', 'Somali Shilling', 'S', 'Somalia', 571.3000, 1, 0, 70, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(73, 'ETB', 'Ethiopian Birr', 'Br', 'Ethiopia', 143.9200, 1, 0, 71, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(74, 'TZS', 'Tanzanian Shilling', 'TSh', 'Tanzania', 2445.6500, 1, 0, 72, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(75, 'UGX', 'Ugandan Shilling', 'USh', 'Uganda', 3430.1500, 1, 0, 73, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(76, 'RWF', 'Rwandan Franc', 'RF', 'Rwanda', 1452.9700, 1, 0, 74, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(77, 'BIF', 'Burundian Franc', 'FBu', 'Burundi', 2959.3900, 1, 0, 75, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(78, 'MWK', 'Malawian Kwacha', 'MK', 'Malawi', 1743.1500, 1, 0, 76, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(79, 'ZMW', 'Zambian Kwacha', 'ZK', 'Zambia', 23.8200, 1, 0, 77, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(80, 'BWP', 'Botswana Pula', 'P', 'Botswana', 14.1500, 1, 0, 78, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(81, 'NAD', 'Namibian Dollar', 'N$', 'Namibia', 17.2000, 1, 0, 79, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(82, 'SZL', 'Swazi Lilangeni', 'L', 'Eswatini', 17.2000, 1, 0, 80, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(83, 'LSL', 'Lesotho Loti', 'L', 'Lesotho', 17.2000, 1, 0, 81, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(84, 'MUR', 'Mauritian Rupee', '₨', 'Mauritius', 45.3600, 1, 0, 82, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(85, 'SCR', 'Seychellois Rupee', '₨', 'Seychelles', 14.6500, 1, 0, 83, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(86, 'MAD', 'Moroccan Dirham', 'د.م.', 'Morocco', 9.1200, 1, 0, 84, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(87, 'TND', 'Tunisian Dinar', 'د.ت', 'Tunisia', 2.9100, 1, 0, 85, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(88, 'DZD', 'Algerian Dinar', 'د.ج', 'Algeria', 129.2400, 1, 0, 86, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(89, 'LYD', 'Libyan Dinar', 'ل.د', 'Libya', 5.3900, 1, 0, 87, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(90, 'SDG', 'Sudanese Pound', 'ج.س.', 'Sudan', 454.3000, 1, 0, 88, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(91, 'SSP', 'South Sudanese Pound', '£', 'South Sudan', 4722.1700, 1, 0, 89, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(92, 'CDF', 'Congolese Franc', 'FC', 'Democratic Republic of Congo', 2580.5500, 1, 0, 90, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(93, 'XAF', 'Central African CFA Franc', 'FCFA', 'Central African Republic', 560.2800, 1, 0, 91, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(94, 'XOF', 'West African CFA Franc', 'CFA', 'Senegal', 560.2800, 1, 0, 92, '2025-10-06 21:42:59', '2025-10-07 02:33:06'),
(95, 'GMD', 'Gambian Dalasi', 'D', 'Gambia', 73.4100, 1, 0, 93, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(96, 'GNF', 'Guinean Franc', 'FG', 'Guinea', 8692.7600, 1, 0, 94, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(97, 'SLL', 'Sierra Leonean Leone', 'Le', 'Sierra Leone', 23337.0400, 1, 0, 95, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(98, 'LRD', 'Liberian Dollar', 'L$', 'Liberia', 181.5600, 1, 0, 96, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(99, 'CVE', 'Cape Verdean Escudo', '$', 'Cape Verde', 94.1800, 1, 0, 97, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(100, 'STN', 'São Tomé and Príncipe Dobra', 'Db', 'São Tomé and Príncipe', 20.9300, 1, 0, 98, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(101, 'AOA', 'Angolan Kwanza', 'Kz', 'Angola', 920.1900, 1, 0, 99, '2025-10-06 21:42:59', '2025-10-07 02:33:05'),
(102, 'ZWL', 'Zimbabwean Dollar', 'Z$', 'Zimbabwe', 26.6500, 1, 0, 100, '2025-10-06 21:42:59', '2025-10-07 02:33:06');

-- --------------------------------------------------------

--
-- Table structure for table `currency_exchange_rate_history`
--

CREATE TABLE `currency_exchange_rate_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `currency_id` bigint(20) UNSIGNED NOT NULL,
  `exchange_rate` decimal(20,6) NOT NULL,
  `previous_rate` decimal(20,6) DEFAULT NULL,
  `rate_change` decimal(10,6) DEFAULT NULL,
  `source` varchar(191) NOT NULL DEFAULT 'manual',
  `api_provider` varchar(191) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `effective_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 1, 1, 'Accounts Department', NULL, NULL, NULL, NULL, 1, 1, '2025-09-14 04:36:38', '2025-09-14 04:36:38');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(191) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fiscal_periods`
--

CREATE TABLE `fiscal_periods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `comp_id` bigint(20) UNSIGNED NOT NULL,
  `fiscal_year` varchar(4) NOT NULL,
  `period_number` int(11) NOT NULL,
  `period_name` varchar(191) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `period_type` enum('Monthly','Quarterly','Semi-Annual','Annual','Custom') NOT NULL DEFAULT 'Monthly',
  `status` enum('Open','Locked','Closed') NOT NULL DEFAULT 'Open',
  `is_adjustment_period` tinyint(1) NOT NULL DEFAULT 0,
  `closing_notes` text DEFAULT NULL,
  `closed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fiscal_periods`
--

INSERT INTO `fiscal_periods` (`id`, `comp_id`, `fiscal_year`, `period_number`, `period_name`, `start_date`, `end_date`, `period_type`, `status`, `is_adjustment_period`, `closing_notes`, `closed_by`, `closed_at`, `created_at`, `updated_at`) VALUES
(1, 1, '2026', 1, 'January 2026', '2026-01-01', '2026-01-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(2, 1, '2026', 2, 'February 2026', '2026-02-01', '2026-02-28', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(3, 1, '2026', 3, 'March 2026', '2026-03-01', '2026-03-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(4, 1, '2026', 4, 'April 2026', '2026-04-01', '2026-04-30', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(5, 1, '2026', 5, 'May 2026', '2026-05-01', '2026-05-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(6, 1, '2026', 6, 'June 2026', '2026-06-01', '2026-06-30', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(7, 1, '2026', 7, 'July 2026', '2026-07-01', '2026-07-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(8, 1, '2026', 8, 'August 2026', '2026-08-01', '2026-08-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(9, 1, '2026', 9, 'September 2026', '2026-09-01', '2026-09-30', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(10, 1, '2026', 10, 'October 2026', '2026-10-01', '2026-10-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(11, 1, '2026', 11, 'November 2026', '2026-11-01', '2026-11-30', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(12, 1, '2026', 12, 'December 2026', '2026-12-01', '2026-12-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(13, 1, '2026', 13, 'Adjustments 2026', '2027-01-01', '2027-01-06', 'Custom', 'Open', 1, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(14, 1, '2027', 1, 'January 2027', '2027-01-01', '2027-01-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(15, 1, '2027', 2, 'February 2027', '2027-02-01', '2027-02-28', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(16, 1, '2027', 3, 'March 2027', '2027-03-01', '2027-03-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(17, 1, '2027', 4, 'April 2027', '2027-04-01', '2027-04-30', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(18, 1, '2027', 5, 'May 2027', '2027-05-01', '2027-05-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(19, 1, '2027', 6, 'June 2027', '2027-06-01', '2027-06-30', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(20, 1, '2027', 7, 'July 2027', '2027-07-01', '2027-07-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(21, 1, '2027', 8, 'August 2027', '2027-08-01', '2027-08-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(22, 1, '2027', 9, 'September 2027', '2027-09-01', '2027-09-30', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(23, 1, '2027', 10, 'October 2027', '2027-10-01', '2027-10-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(24, 1, '2027', 11, 'November 2027', '2027-11-01', '2027-11-30', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(25, 1, '2027', 12, 'December 2027', '2027-12-01', '2027-12-31', 'Monthly', 'Open', 0, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20'),
(26, 1, '2027', 13, 'Adjustments 2027', '2028-01-01', '2028-01-06', 'Custom', 'Open', 1, NULL, NULL, NULL, '2026-03-01 16:36:20', '2026-03-01 16:36:20');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(191) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 1, 'BASFOOT LOCATION 1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2025-09-14 04:19:02', '2025-10-05 02:19:54');

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
(12, 2, 2, 'Chart of Accounts', '/accounts/chart-of-accounts', 'file-text', 1, 2, '2025-10-06 04:23:27', '2025-10-06 08:40:19', NULL),
(13, 2, 2, 'Voucher Number Configuration', '/accounts/voucher-number-configuration', 'settings', 1, 1, '2025-10-06 04:23:27', '2025-10-06 08:40:19', NULL),
(14, 2, 4, 'Journal Voucher', '/accounts/journal-voucher', 'file-text', 1, 1, '2025-10-06 10:22:48', '2025-10-06 10:22:48', NULL),
(34, 2, 10, 'General Ledger', '/accounts/general-ledger', 'file-text', 1, 1, '2025-10-07 02:15:23', '2025-10-07 02:15:23', NULL),
(35, 1, 12, 'Activity Logs', '/system/logs/activity', 'list', 1, 1, '2025-10-09 08:49:21', '2025-10-09 08:49:21', NULL),
(36, 1, 12, 'Deleted Items', '/system/logs/deleted-items', 'list', 1, 2, '2025-10-09 08:49:59', '2025-10-09 08:49:59', NULL),
(37, 1, 12, 'Security Logs', '/system/logs/security', 'list', 1, 3, '2025-10-09 08:50:36', '2025-10-09 08:50:36', NULL),
(38, 1, 12, 'Log Report', '/system/logs/reports', 'list', 1, 4, '2025-10-09 08:51:32', '2025-10-09 08:51:32', NULL),
(39, 2, 10, 'Currency Ledger', '/accounts/currency-ledger', 'file-text', 1, 1, '2025-10-07 02:15:23', '2025-10-07 02:15:23', NULL),
(40, 1, 1, 'Code Configuration', '/system/code-configurations', 'Code', 1, 40, '2025-10-11 04:47:42', '2025-10-11 04:47:42', NULL),
(41, 2, 10, 'Trial Balance', '/accounts/trial-balance', 'file-text', 1, 3, '2025-12-20 06:04:14', '2025-12-20 06:04:14', NULL),
(42, 2, 2, 'Fiscal Year Configuration', '/accounts/fiscal-year-configuration', 'calendar', 1, 2, '2026-02-27 04:06:08', '2026-02-27 04:06:08', NULL),
(43, 2, 10, 'Balance Sheet', '/accounts/balance-sheet', 'pie-chart', 1, 4, '2026-02-27 04:06:19', '2026-02-27 04:06:19', NULL),
(44, 2, 10, 'Income Statement', '/accounts/income-statement', 'trending-up', 1, 5, '2026-02-27 04:06:31', '2026-02-27 04:06:31', NULL),
(59, 2, 2, 'Chart of Account Codes', '/accounts/code-configuration', 'Code2', 1, 10, '2026-02-27 05:07:36', '2026-02-27 05:07:36', NULL),
(60, 2, 2, 'Bank Accounts', '/accounts/code-configuration/bank', 'Building2', 1, 11, '2026-02-27 05:07:36', '2026-02-27 05:07:36', NULL),
(61, 2, 2, 'Cash Accounts', '/accounts/code-configuration/cash', 'Coins', 1, 12, '2026-02-27 05:07:36', '2026-02-27 05:07:36', NULL),
(62, 2, 10, 'Chart Of Account Report', '/accounts/reports/chart-of-account', 'file-text', 1, 1, '2026-02-28 03:42:11', '2026-02-28 03:42:11', NULL),
(63, 2, 10, 'Cash Book', '/accounts/reports/cash-book', 'file-text', 1, 2, '2026-02-28 03:43:05', '2026-02-28 03:43:05', NULL),
(64, 2, 2, 'Opening Voucher', '/accounts/opening-voucher', 'file-text', 1, 1, '2026-02-28 04:56:29', '2026-02-28 04:56:29', NULL),
(65, 2, 16, 'Bank Vouchers', '/accounts/bank-voucher', 'file-text', 1, 1, '2025-10-06 10:22:48', '2025-10-06 10:22:48', NULL),
(66, 2, 2, 'Account Mapping', '/accounts/account-configuration', 'calendar', 1, 3, '2026-02-27 04:06:08', '2026-02-27 04:06:08', NULL),
(67, 2, 16, 'Cash Vouchers', '/accounts/cash-voucher', 'file-text', 1, 1, '2025-10-06 10:22:48', '2025-10-06 10:22:48', NULL);

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
(34, '2025_10_05_175209_update_exchange_rate_precision_in_currencies_table', 18),
(38, '2024_01_15_000001_add_accounting_fields_to_companies_table', 19),
(39, '2024_01_15_000002_create_transactions_table', 19),
(40, '2024_01_15_000003_create_transaction_entries_table', 19),
(41, '2024_01_15_000004_create_voucher_number_configurations_table', 19),
(42, '2024_01_15_000005_fix_menu_structure', 20),
(43, '2025_10_06_134006_update_voucher_menu_routes', 21),
(45, '2025_10_07_024701_add_auto_voucher_numbering_to_companies_table', 22),
(47, '2025_10_05_184533_add_short_code_to_chart_of_accounts_table', 23),
(48, '2025_10_05_185851_remove_unused_columns_from_chart_of_accounts_table', 24),
(49, '2025_10_06_051133_create_chart_of_accounts_table', 25),
(50, '2025_10_06_152140_add_journal_voucher_menu_to_accounts_module', 26),
(68, '0001_01_01_000002_create_jobs_table', 27),
(69, '2024_10_09_000001_create_logging_tables', 27),
(70, '2024_10_11_000001_create_code_configurations_table', 27),
(71, '2025_01_15_000001_add_fourth_level_to_chart_of_accounts', 27),
(72, '2025_01_15_000002_add_level4_account_to_code_configurations', 27),
(73, '2025_01_15_000003_create_temp_level3_mapping_table', 27),
(74, '2025_10_07_024709_create_currency_exchange_rate_history_table', 27),
(75, '2025_10_07_070926_remove_unnecessary_fields_from_transaction_entries_table', 27),
(76, '2025_10_07_143456_make_description_nullable_in_transactions_table', 27),
(77, '2025_10_07_143648_optimize_description_field_in_transactions_table', 27),
(78, '2025_10_07_165813_add_attachments_to_transactions_table', 27),
(79, '2025_10_11_145248_add_account_fields_to_code_configurations_table', 27),
(80, '2025_10_11_150000_make_code_configuration_fields_nullable', 27),
(81, '2025_10_17_162307_add_attachment_id_to_transaction_entries_table', 27),
(82, '2025_10_17_162932_add_attachment_storage_limit_to_companies_table', 27),
(83, '2026_03_01_000001_add_is_transactional_to_chart_of_accounts', 28),
(84, '2026_02_27_000002_add_fiscal_year_to_transactions_table', 29),
(85, '2026_02_27_000003_add_fiscal_year_income_statement_menus', 30),
(87, '2026_02_27_000001_create_fiscal_periods_table', 31),
(88, '2026_03_02_create_account_configurations_table', 32),
(89, '2026_03_02_102000_extend_account_configurations_config_type_enum', 33),
(90, '2026_03_02_000101_add_bank_fields_to_transactions_and_entries', 34);

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
(210, 1, 1, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(211, 1, 2, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(212, 1, 3, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(213, 1, 4, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(214, 1, 5, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(215, 1, 6, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(216, 1, 7, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(217, 1, 8, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(218, 1, 9, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(219, 1, 12, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(220, 1, 13, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(221, 1, 14, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(222, 1, 34, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(223, 1, 35, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(224, 1, 36, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(225, 1, 37, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(226, 1, 38, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(227, 1, 39, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(228, 1, 40, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(229, 1, 41, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(230, 1, 42, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(231, 1, 43, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(232, 1, 44, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(233, 1, 57, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(234, 1, 58, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(235, 1, 59, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(236, 1, 60, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(237, 1, 61, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(238, 1, 62, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(239, 1, 63, 1, '2026-02-28 03:43:45', '2026-02-28 03:43:45'),
(240, 2, 1, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(241, 2, 2, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(242, 2, 3, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(243, 2, 4, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(244, 2, 5, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(245, 2, 6, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(246, 2, 7, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(247, 2, 8, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(248, 2, 9, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(249, 2, 12, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(250, 2, 13, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(251, 2, 14, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(252, 2, 34, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(253, 2, 35, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(254, 2, 36, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(255, 2, 37, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(256, 2, 38, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(257, 2, 39, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(258, 2, 40, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(259, 2, 41, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(260, 2, 42, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(261, 2, 43, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(262, 2, 44, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(263, 2, 57, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(264, 2, 58, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(265, 2, 59, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(266, 2, 60, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(267, 2, 61, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(268, 2, 62, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(269, 2, 63, 1, '2026-02-28 03:43:55', '2026-02-28 03:43:55'),
(453, 3, 1, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(454, 3, 2, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(455, 3, 3, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(456, 3, 4, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(457, 3, 5, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(458, 3, 6, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(459, 3, 7, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(460, 3, 8, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(461, 3, 9, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(462, 3, 12, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(463, 3, 13, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(464, 3, 14, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(465, 3, 34, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(466, 3, 35, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(467, 3, 36, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(468, 3, 37, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(469, 3, 38, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(470, 3, 39, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(471, 3, 40, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(472, 3, 41, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(473, 3, 42, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(474, 3, 43, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(475, 3, 44, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(476, 3, 59, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(477, 3, 60, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(478, 3, 61, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(479, 3, 62, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(480, 3, 63, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(481, 3, 64, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(482, 3, 65, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(483, 3, 66, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52'),
(484, 3, 67, 1, '2026-03-01 16:43:52', '2026-03-01 16:43:52');

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
(2, 2, 'Configuration', 'accounts-configuration', 1, 2, '2025-10-05 12:19:22', '2025-10-05 12:19:22', NULL),
(4, 2, 'Journal Vouchers', 'journal-vouchers', 1, 2, '2025-10-06 07:13:09', '2025-10-06 07:13:09', NULL),
(10, 2, 'Reports', 'reports', 1, 3, '2025-10-07 02:05:16', '2025-10-07 02:05:16', NULL),
(11, 2, 'Accounting', 'accounting', 1, 1, '2025-10-07 02:07:30', '2025-10-07 02:07:30', NULL),
(12, 1, 'Log Reports', 'log-reports', 1, 2, '2025-10-09 08:47:01', '2025-10-09 08:47:01', NULL),
(16, 2, 'Bank/Cash Vouchers', 'bank-cash', 1, 3, '2025-10-06 07:13:09', '2025-10-06 07:13:09', NULL);

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

-- --------------------------------------------------------

--
-- Table structure for table `tbl_audit_logs`
--

CREATE TABLE `tbl_audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `location_id` int(10) UNSIGNED DEFAULT NULL,
  `module_name` varchar(100) DEFAULT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action_type` enum('CREATE','READ','UPDATE','DELETE','POST','UNPOST','APPROVE','REJECT','IMPORT','EXPORT') NOT NULL,
  `old_values` longtext DEFAULT NULL,
  `new_values` longtext DEFAULT NULL,
  `changed_fields` longtext DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_audit_logs`
--

INSERT INTO `tbl_audit_logs` (`id`, `user_id`, `company_id`, `location_id`, `module_name`, `table_name`, `record_id`, `action_type`, `old_values`, `new_values`, `changed_fields`, `ip_address`, `user_agent`, `session_id`, `description`, `created_at`) VALUES
(1, 1, 1, 1, 'Accounts', 'voucher_number_configurations', 3, 'CREATE', NULL, '{\"voucher_type\":\"Payment\",\"prefix\":\"PV\",\"number_length\":\"4\",\"running_number\":1,\"reset_frequency\":\"Monthly\",\"is_active\":true,\"comp_id\":1,\"location_id\":1,\"created_by\":1}', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 OPR/127.0.0.0', 'qdyyqlXOwxooTruV953Oo6IENtH66PlEiNuEnEI9', 'Voucher Number Configuration CREATE: Payment - PV', '2026-03-01 16:29:07'),
(2, 1, 1, 1, 'Accounts', 'voucher_number_configurations', 4, 'CREATE', NULL, '{\"voucher_type\":\"Receipt\",\"prefix\":\"RV\",\"number_length\":\"4\",\"running_number\":1,\"reset_frequency\":\"Monthly\",\"is_active\":true,\"comp_id\":1,\"location_id\":1,\"created_by\":1}', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 OPR/127.0.0.0', 'qdyyqlXOwxooTruV953Oo6IENtH66PlEiNuEnEI9', 'Voucher Number Configuration CREATE: Receipt - RV', '2026-03-01 16:29:19'),
(3, 1, 1, 1, 'Accounts', 'transactions', 12, 'CREATE', NULL, '{\"voucher_number\":\"BPV0002\",\"voucher_date\":\"2026-03-01\",\"voucher_type\":\"Bank Payment\",\"reference_number\":\"33232\",\"description\":null,\"status\":\"Draft\",\"total_debit\":28328.611898016992,\"total_credit\":0,\"currency_code\":\"PKR\",\"comp_id\":1,\"location_id\":1,\"created_by\":1}', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 OPR/127.0.0.0', 'qdyyqlXOwxooTruV953Oo6IENtH66PlEiNuEnEI9', 'Journal Voucher CREATE: BPV0002', '2026-03-01 16:36:46'),
(4, 1, 1, 1, 'Accounts', 'transactions', 13, 'CREATE', NULL, '{\"voucher_number\":\"CRV0006\",\"voucher_date\":\"2026-03-01\",\"voucher_type\":\"Cash Receipt\",\"reference_number\":null,\"description\":null,\"status\":\"Draft\",\"total_debit\":0,\"total_credit\":2832.8611898016993,\"currency_code\":\"PKR\",\"comp_id\":1,\"location_id\":1,\"created_by\":1}', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 OPR/127.0.0.0', 'qdyyqlXOwxooTruV953Oo6IENtH66PlEiNuEnEI9', 'Journal Voucher CREATE: CRV0006', '2026-03-01 17:01:17'),
(5, 1, 1, 1, 'Accounts', 'transactions', 13, 'POST', '{\"status\":\"Draft\",\"posted_at\":null,\"posted_by\":null}', '{\"voucher_number\":\"CRV0006\",\"voucher_date\":\"2026-03-01\",\"voucher_type\":\"Cash Receipt\",\"reference_number\":null,\"description\":null,\"status\":\"Posted\",\"total_debit\":\"0.00\",\"total_credit\":\"0.00\",\"currency_code\":\"PKR\",\"comp_id\":1,\"location_id\":1,\"posted_at\":\"2026-03-01T22:01:22.007181Z\",\"posted_by\":1}', '{\"voucher_number\":{\"old\":null,\"new\":\"CRV0006\"},\"voucher_date\":{\"old\":null,\"new\":\"2026-03-01\"},\"voucher_type\":{\"old\":null,\"new\":\"Cash Receipt\"},\"status\":{\"old\":\"Draft\",\"new\":\"Posted\"},\"total_debit\":{\"old\":null,\"new\":\"0.00\"},\"total_credit\":{\"old\":null,\"new\":\"0.00\"},\"currency_code\":{\"old\":null,\"new\":\"PKR\"},\"comp_id\":{\"old\":null,\"new\":1},\"location_id\":{\"old\":null,\"new\":1},\"posted_at\":{\"old\":null,\"new\":\"2026-03-01T22:01:22.007181Z\"},\"posted_by\":{\"old\":null,\"new\":1}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 OPR/127.0.0.0', 'qdyyqlXOwxooTruV953Oo6IENtH66PlEiNuEnEI9', 'Journal Voucher POST: CRV0006', '2026-03-01 17:01:22'),
(6, 1, 1, 1, 'Accounts', 'transactions', 12, 'POST', '{\"status\":\"Draft\",\"posted_at\":null,\"posted_by\":null}', '{\"voucher_number\":\"BPV0002\",\"voucher_date\":\"2026-03-01\",\"voucher_type\":\"Bank Payment\",\"reference_number\":\"33232\",\"description\":null,\"status\":\"Posted\",\"total_debit\":\"28328.61\",\"total_credit\":\"28328.61\",\"currency_code\":\"PKR\",\"comp_id\":1,\"location_id\":1,\"posted_at\":\"2026-03-01T22:01:27.684980Z\",\"posted_by\":1}', '{\"voucher_number\":{\"old\":null,\"new\":\"BPV0002\"},\"voucher_date\":{\"old\":null,\"new\":\"2026-03-01\"},\"voucher_type\":{\"old\":null,\"new\":\"Bank Payment\"},\"reference_number\":{\"old\":null,\"new\":\"33232\"},\"status\":{\"old\":\"Draft\",\"new\":\"Posted\"},\"total_debit\":{\"old\":null,\"new\":\"28328.61\"},\"total_credit\":{\"old\":null,\"new\":\"28328.61\"},\"currency_code\":{\"old\":null,\"new\":\"PKR\"},\"comp_id\":{\"old\":null,\"new\":1},\"location_id\":{\"old\":null,\"new\":1},\"posted_at\":{\"old\":null,\"new\":\"2026-03-01T22:01:27.684980Z\"},\"posted_by\":{\"old\":null,\"new\":1}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 OPR/127.0.0.0', 'qdyyqlXOwxooTruV953Oo6IENtH66PlEiNuEnEI9', 'Journal Voucher POST: BPV0002', '2026-03-01 17:01:27');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_change_history`
--

CREATE TABLE `tbl_change_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` bigint(20) UNSIGNED NOT NULL,
  `record_identifier` varchar(191) DEFAULT NULL,
  `field_name` varchar(100) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `changed_by` bigint(20) UNSIGNED NOT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `change_reason` varchar(500) DEFAULT NULL,
  `change_ip` varchar(45) DEFAULT NULL,
  `change_type` enum('MANUAL','IMPORT','API','SYSTEM') NOT NULL DEFAULT 'MANUAL',
  `is_reversed` tinyint(1) NOT NULL DEFAULT 0,
  `reversed_at` timestamp NULL DEFAULT NULL,
  `reversed_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_deleted_data_recovery`
--

CREATE TABLE `tbl_deleted_data_recovery` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_table` varchar(100) NOT NULL,
  `original_id` bigint(20) UNSIGNED NOT NULL,
  `record_identifier` varchar(191) DEFAULT NULL,
  `data_snapshot` longtext NOT NULL,
  `related_data` longtext DEFAULT NULL,
  `deleted_by` bigint(20) UNSIGNED NOT NULL,
  `deleted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delete_reason` varchar(500) DEFAULT NULL,
  `delete_ip` varchar(45) DEFAULT NULL,
  `recovery_expires_at` timestamp NULL DEFAULT NULL,
  `recovered_at` timestamp NULL DEFAULT NULL,
  `recovered_by` bigint(20) UNSIGNED DEFAULT NULL,
  `recovery_notes` text DEFAULT NULL,
  `status` enum('DELETED','RECOVERED','EXPIRED','PERMANENTLY_DELETED') NOT NULL DEFAULT 'DELETED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_report_logs`
--

CREATE TABLE `tbl_report_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `report_name` varchar(191) NOT NULL,
  `report_type` varchar(100) DEFAULT NULL,
  `parameters` longtext DEFAULT NULL,
  `date_range_from` date DEFAULT NULL,
  `date_range_to` date DEFAULT NULL,
  `export_format` varchar(20) DEFAULT NULL,
  `record_count` int(11) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL COMMENT 'bytes',
  `generation_time` int(11) DEFAULT NULL COMMENT 'milliseconds',
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_security_logs`
--

CREATE TABLE `tbl_security_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `username` varchar(191) DEFAULT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_status` enum('SUCCESS','FAILED','BLOCKED','WARNING') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `location_info` varchar(255) DEFAULT NULL,
  `additional_data` longtext DEFAULT NULL,
  `risk_level` enum('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'LOW',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 'System', NULL, 'Administrator', 'admin@erpsystem.com', '+1234567890', 'admin', '12345', 1, 1, 1, NULL, '$2y$12$QZ/KZc6V/wK3YGJDrzVLaehK4R7EU.wRkOugBu/7kgg47SxX3yHPm', '09609d6d8574d219eae26aa12db6436adba5e3fef34a3f760f649270ce378763', 'qDd4mnXaTtIq2pNZCpchlMrBvDAB2NVEfUbAtUtpZyW8BrFoilzg2ikGzzaDmK0XNTwNBNhTZj5Qb52lOa2uFEI3dPQ2TP8XmJqH', 'active', 'super_admin', '{\"users\":[\"create\",\"read\",\"update\",\"delete\"],\"financial\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"create\",\"read\",\"update\",\"delete\"],\"settings\":[\"create\",\"read\",\"update\",\"delete\"],\"system\":[\"create\",\"read\",\"update\",\"delete\"]}', NULL, 'UTC', 'en', 'USD', 'system', '2026-03-01 15:08:30', '127.0.0.1', 0, NULL, 0, NULL, NULL, 'pxfJJnGYwPfnSFErPVcOY5A25CXLIJuUwlNRZEJm', NULL, 0, '2025-08-14 10:19:49', '[{\"timestamp\":\"2026-03-01T20:08:30.672025Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Code\\/1.109.5 Chrome\\/142.0.7444.265 Electron\\/39.3.0 Safari\\/537.36\",\"success\":true},{\"timestamp\":\"2026-03-01T19:12:49.001408Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/143.0.0.0 Safari\\/537.36 OPR\\/127.0.0.0\",\"success\":true},{\"timestamp\":\"2026-03-01T14:40:31.384519Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/143.0.0.0 Safari\\/537.36 OPR\\/127.0.0.0\",\"success\":true},{\"timestamp\":\"2026-03-01T12:07:07.169243Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/143.0.0.0 Safari\\/537.36 OPR\\/127.0.0.0\",\"success\":true},{\"timestamp\":\"2026-02-28T13:49:48.652226Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/143.0.0.0 Safari\\/537.36 OPR\\/127.0.0.0\",\"success\":true},{\"timestamp\":\"2026-02-28T08:40:15.826938Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/143.0.0.0 Safari\\/537.36 OPR\\/127.0.0.0\",\"success\":true},{\"timestamp\":\"2026-02-27T16:53:45.993321Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/143.0.0.0 Safari\\/537.36 OPR\\/127.0.0.0\",\"success\":true},{\"timestamp\":\"2026-02-27T07:41:38.810581Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/143.0.0.0 Safari\\/537.36 OPR\\/127.0.0.0\",\"success\":true},{\"timestamp\":\"2026-02-25T17:53:18.601760Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/143.0.0.0 Safari\\/537.36 OPR\\/127.0.0.0\",\"success\":true},{\"timestamp\":\"2025-12-20T12:13:55.996425Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/141.0.0.0 Safari\\/537.36 OPR\\/125.0.0.0\",\"success\":true},{\"timestamp\":\"2025-12-20T11:28:36.081856Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/141.0.0.0 Safari\\/537.36 OPR\\/125.0.0.0\",\"success\":true},{\"timestamp\":\"2025-12-20T10:59:35.149238Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/141.0.0.0 Safari\\/537.36 OPR\\/125.0.0.0\",\"success\":true},{\"timestamp\":\"2025-12-20T10:33:26.249869Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/141.0.0.0 Safari\\/537.36 OPR\\/125.0.0.0\",\"success\":true},{\"timestamp\":\"2025-12-20T10:26:04.834989Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/141.0.0.0 Safari\\/537.36 OPR\\/125.0.0.0\",\"success\":true},{\"timestamp\":\"2025-11-16T13:44:06.012419Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-11-16T13:15:38.480318Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-24T14:42:53.152903Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-17T16:02:14.237220Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-17T15:31:13.866417Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-16T10:25:33.336675Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true}]', NULL, NULL, '2025-08-14 10:19:49', '2026-03-01 15:08:30', NULL, NULL),
(2, 'Finance', NULL, 'Manager', 'finance@erpsystem.com', '+1234567891', 'finance_mgr', '12346', 1, 1, 1, NULL, '$2y$12$.Kwr9rgMKPjrBG45kDk8x.kTh/l9u1VSLPMZ/BAI0n2Jw69lIf9SG', NULL, NULL, 'active', 'manager', '{\"financial\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"read\",\"create\"],\"users\":[\"read\"]}', NULL, 'UTC', 'en', 'USD', 'light', NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 0, '2025-08-14 10:19:50', NULL, NULL, NULL, '2025-08-14 10:19:50', '2025-08-14 10:19:50', NULL, NULL),
(3, 'Account', NULL, 'Executive', 'accounts@erpsystem.com', '+1234567892', 'acc_exec', '12347', 1, 1, 1, NULL, '$2y$12$voUVJ1fWNi9mo0rkJppxZ.V96Gn0MF.y6L1KSjKBz7tJGp/7/QN3m', NULL, NULL, 'active', 'user', '{\"financial\":[\"create\",\"read\",\"update\"],\"reports\":[\"read\"]}', NULL, 'Asia/Karachi', 'en', 'PKR', 'dark', NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 1, '2025-05-14 10:19:50', NULL, NULL, NULL, '2025-08-14 10:19:50', '2025-08-14 10:19:50', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_activity_logs`
--

CREATE TABLE `tbl_user_activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `session_id` varchar(191) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `route_name` varchar(191) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `controller` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `parameters` longtext DEFAULT NULL,
  `response_status` int(11) DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL COMMENT 'in milliseconds',
  `memory_usage` int(11) DEFAULT NULL COMMENT 'in bytes',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `temp_level3_mapping`
--

CREATE TABLE `temp_level3_mapping` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `old_parent_id` bigint(20) UNSIGNED NOT NULL,
  `new_parent_id` bigint(20) UNSIGNED NOT NULL,
  `level4_account_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `voucher_number` varchar(50) NOT NULL,
  `voucher_date` date NOT NULL,
  `voucher_type` varchar(50) NOT NULL,
  `voucher_sub_type` varchar(50) DEFAULT NULL,
  `bank_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `status` enum('Draft','Pending','Approved','Posted','Rejected') NOT NULL DEFAULT 'Draft',
  `total_debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency_code` varchar(3) NOT NULL DEFAULT 'USD',
  `exchange_rate` decimal(10,6) NOT NULL DEFAULT 1.000000,
  `base_currency_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `attachments` text DEFAULT NULL,
  `period_id` bigint(20) UNSIGNED NOT NULL,
  `fiscal_year` varchar(4) DEFAULT NULL,
  `comp_id` bigint(20) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `posted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `is_reversed` tinyint(1) NOT NULL DEFAULT 0,
  `reversal_transaction_id` bigint(20) UNSIGNED DEFAULT NULL,
  `original_transaction_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `voucher_number`, `voucher_date`, `voucher_type`, `voucher_sub_type`, `bank_account_id`, `reference_number`, `description`, `status`, `total_debit`, `total_credit`, `currency_code`, `exchange_rate`, `base_currency_total`, `attachments`, `period_id`, `fiscal_year`, `comp_id`, `location_id`, `created_by`, `approved_by`, `posted_by`, `approved_at`, `posted_at`, `rejection_reason`, `is_reversed`, `reversal_transaction_id`, `original_transaction_id`, `created_at`, `updated_at`) VALUES
(1, 'JV-69a4919e10b8a', '2026-01-06', 'Journal', NULL, NULL, 'INV-SUPP-001', 'Purchase on credit from supplier', 'Posted', 250000.00, 250000.00, 'PKR', 1.000000, 250000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(2, 'JV-69a4919e12333', '2026-01-07', 'Journal', NULL, NULL, 'BILL-SUPP-002', 'Purchase on credit from supplier', 'Posted', 75000.00, 75000.00, 'PKR', 1.000000, 75000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(3, 'JV-69a4919e13f10', '2026-01-08', 'Journal', NULL, NULL, 'INV-CUST-001', 'Credit sale to customer', 'Posted', 350000.00, 350000.00, 'PKR', 1.000000, 350000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(4, 'JV-69a4919e15a12', '2026-01-09', 'Journal', NULL, NULL, 'INV-CUST-002', 'Credit sale to customer', 'Posted', 180000.00, 180000.00, 'PKR', 1.000000, 180000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(5, 'JV-69a4919e17606', '2026-01-10', 'Journal', NULL, NULL, 'CASH-001', 'Cash sale - payment received immediately', 'Posted', 125000.00, 125000.00, 'PKR', 1.000000, 125000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(6, 'JV-69a4919e193d4', '2026-01-11', 'Journal', NULL, NULL, 'RCPT-CUST-001', 'Payment received from customer', 'Posted', 200000.00, 200000.00, 'PKR', 1.000000, 200000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(7, 'JV-69a4919e1acb1', '2026-01-12', 'Journal', NULL, NULL, 'PAY-SUPP-001', 'Payment made to supplier', 'Posted', 150000.00, 150000.00, 'PKR', 1.000000, 150000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(8, 'JV-69a4919e1c874', '2026-01-13', 'Journal', NULL, NULL, 'DEP-001', 'Cash deposited to bank', 'Posted', 80000.00, 80000.00, 'PKR', 1.000000, 80000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(9, 'JV-69a4919e1deeb', '2026-01-14', 'Journal', NULL, NULL, 'WD-001', 'Cash withdrawn from bank', 'Posted', 50000.00, 50000.00, 'PKR', 1.000000, 50000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(10, 'JV-69a4919e1f4ba', '2026-01-15', 'Journal', NULL, NULL, 'EXP-CASH-001', 'Expense paid by cash', 'Posted', 35000.00, 35000.00, 'PKR', 1.000000, 35000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(11, 'JV-69a4919e20e12', '2026-01-16', 'Journal', NULL, NULL, 'EXP-BANK-001', 'Expense paid by bank transfer', 'Posted', 65000.00, 65000.00, 'PKR', 1.000000, 65000.00, NULL, 1, '2026', 1, 1, 1, NULL, NULL, NULL, '2026-03-01 14:21:02', NULL, 0, NULL, NULL, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(12, 'BPV0002', '2026-03-01', 'Bank Payment', 'Bank Payment', 28, '33232', NULL, 'Posted', 28328.61, 28328.61, 'PKR', 1.000000, 28328.61, '[]', 3, '2026', 1, 1, 1, NULL, 1, NULL, '2026-03-01 17:01:27', NULL, 0, NULL, NULL, '2026-03-01 16:36:46', '2026-03-01 17:01:27'),
(13, 'CRV0006', '2026-03-01', 'Cash Receipt', 'Cash Receipt', 26, NULL, NULL, 'Posted', 0.00, 0.00, 'PKR', 1.000000, 0.00, '[]', 3, '2026', 1, 1, 1, NULL, 1, NULL, '2026-03-01 17:01:22', NULL, 0, NULL, NULL, '2026-03-01 17:01:17', '2026-03-01 17:01:22');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_entries`
--

CREATE TABLE `transaction_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_id` bigint(20) UNSIGNED NOT NULL,
  `line_number` int(11) NOT NULL,
  `account_id` bigint(20) UNSIGNED NOT NULL,
  `description` text DEFAULT NULL,
  `debit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `credit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency_code` varchar(3) NOT NULL,
  `exchange_rate` decimal(10,6) NOT NULL,
  `base_debit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `base_credit_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `attachment_id` varchar(191) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `cheque_number` varchar(100) DEFAULT NULL,
  `cheque_date` date DEFAULT NULL,
  `slip_number` varchar(100) DEFAULT NULL,
  `comp_id` bigint(20) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction_entries`
--

INSERT INTO `transaction_entries` (`id`, `transaction_id`, `line_number`, `account_id`, `description`, `debit_amount`, `credit_amount`, `currency_code`, `exchange_rate`, `base_debit_amount`, `base_credit_amount`, `attachment_id`, `reference`, `cheque_number`, `cheque_date`, `slip_number`, `comp_id`, `location_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 30, 'Goods/services purchased', 250000.00, 0.00, 'PKR', 1.000000, 250000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(2, 1, 2, 65, 'Amount owed to supplier', 0.00, 250000.00, 'PKR', 1.000000, 0.00, 250000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(3, 2, 1, 259, 'Goods/services purchased', 75000.00, 0.00, 'PKR', 1.000000, 75000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(4, 2, 2, 65, 'Amount owed to supplier', 0.00, 75000.00, 'PKR', 1.000000, 0.00, 75000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(5, 3, 1, 29, 'Amount due from customer', 350000.00, 0.00, 'PKR', 1.000000, 350000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(6, 3, 2, 183, 'Sales revenue earned', 0.00, 350000.00, 'PKR', 1.000000, 0.00, 350000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(7, 4, 1, 29, 'Amount due from customer', 180000.00, 0.00, 'PKR', 1.000000, 180000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(8, 4, 2, 183, 'Sales revenue earned', 0.00, 180000.00, 'PKR', 1.000000, 0.00, 180000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(9, 5, 1, 26, 'Cash received from customer', 125000.00, 0.00, 'PKR', 1.000000, 125000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(10, 5, 2, 183, 'Sales revenue earned', 0.00, 125000.00, 'PKR', 1.000000, 0.00, 125000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(11, 6, 1, 28, 'Deposited to bank from customer', 200000.00, 0.00, 'PKR', 1.000000, 200000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(12, 6, 2, 29, 'Customer receivable cleared', 0.00, 200000.00, 'PKR', 1.000000, 0.00, 200000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(13, 7, 1, 65, 'Supplier payable cleared', 150000.00, 0.00, 'PKR', 1.000000, 150000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(14, 7, 2, 28, 'Paid from bank account', 0.00, 150000.00, 'PKR', 1.000000, 0.00, 150000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(15, 8, 1, 28, 'Cash deposited to bank', 80000.00, 0.00, 'PKR', 1.000000, 80000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(16, 8, 2, 26, 'Cash withdrawn from hand', 0.00, 80000.00, 'PKR', 1.000000, 0.00, 80000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(17, 9, 1, 26, 'Cash received from bank', 50000.00, 0.00, 'PKR', 1.000000, 50000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(18, 9, 2, 28, 'Withdrawn from bank account', 0.00, 50000.00, 'PKR', 1.000000, 0.00, 50000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(19, 10, 1, 259, 'Operating expense', 35000.00, 0.00, 'PKR', 1.000000, 35000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(20, 10, 2, 26, 'Paid by cash', 0.00, 35000.00, 'PKR', 1.000000, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(21, 11, 1, 259, 'Operating expense', 65000.00, 0.00, 'PKR', 1.000000, 65000.00, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(22, 11, 2, 28, 'Paid by bank', 0.00, 65000.00, 'PKR', 1.000000, 0.00, 65000.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 14:21:02', '2026-03-01 14:21:02'),
(23, 12, 1, 304, NULL, 100.00, 0.00, 'USD', 0.003530, 28328.61, 0.00, NULL, NULL, '34', '2026-02-28', '233', 1, 1, '2026-03-01 16:36:46', '2026-03-01 16:36:46'),
(24, 12, 2, 28, 'Auto contra bank entry', 0.00, 28328.61, 'PKR', 1.000000, 0.00, 28328.61, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 16:36:46', '2026-03-01 16:36:46'),
(25, 13, 1, 315, NULL, 0.00, 10.00, 'USD', 0.003530, 0.00, 2832.86, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 17:01:17', '2026-03-01 17:01:17'),
(26, 13, 2, 26, 'Auto contra Cash entry', 2832.86, 0.00, 'PKR', 1.000000, 2832.86, 0.00, NULL, NULL, NULL, NULL, NULL, 1, 1, '2026-03-01 17:01:17', '2026-03-01 17:01:17');

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
(121, 2, 1, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(122, 2, 2, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(123, 2, 3, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(124, 2, 4, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(125, 2, 5, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(126, 2, 6, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(127, 2, 7, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(128, 2, 8, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(129, 2, 9, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(130, 2, 12, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(131, 2, 13, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(132, 2, 14, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(133, 2, 34, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(134, 2, 35, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(135, 2, 36, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(136, 2, 37, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(137, 2, 38, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(138, 2, 39, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(139, 2, 40, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(140, 3, 1, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(141, 3, 2, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(142, 3, 3, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(143, 3, 4, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(144, 3, 5, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(145, 3, 6, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(146, 3, 7, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(147, 3, 8, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(148, 3, 9, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(149, 3, 12, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(150, 3, 13, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(151, 3, 14, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(152, 3, 34, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(153, 3, 35, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(154, 3, 36, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(155, 3, 37, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(156, 3, 38, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(157, 3, 39, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(158, 3, 40, 1, 1, 1, 1, '2025-10-14 10:51:53', '2025-10-14 10:51:53'),
(202, 3, 42, 1, 1, 1, 1, '2026-02-27 04:07:21', '2026-02-27 04:07:21'),
(203, 3, 43, 1, 1, 1, 1, '2026-02-27 04:07:21', '2026-02-27 04:07:21'),
(204, 3, 44, 1, 1, 1, 1, '2026-02-27 04:07:21', '2026-02-27 04:07:21'),
(208, 2, 42, 1, 1, 1, 1, '2026-02-27 04:07:21', '2026-02-27 04:07:21'),
(209, 2, 43, 1, 1, 1, 1, '2026-02-27 04:07:21', '2026-02-27 04:07:21'),
(210, 2, 44, 1, 1, 1, 1, '2026-02-27 04:07:21', '2026-02-27 04:07:21'),
(337, 1, 1, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(338, 1, 2, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(339, 1, 3, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(340, 1, 4, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(341, 1, 5, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(342, 1, 6, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(343, 1, 7, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(344, 1, 8, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(345, 1, 9, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(346, 1, 12, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(347, 1, 13, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(348, 1, 14, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(349, 1, 34, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(350, 1, 35, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(351, 1, 36, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(352, 1, 37, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(353, 1, 38, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(354, 1, 39, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(355, 1, 40, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(356, 1, 41, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(357, 1, 42, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(358, 1, 43, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(359, 1, 44, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(360, 1, 57, 0, 0, 0, 0, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(361, 1, 58, 0, 0, 0, 0, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(362, 1, 59, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(363, 1, 60, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(364, 1, 61, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(365, 1, 62, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(366, 1, 63, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(367, 1, 64, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(368, 1, 65, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(369, 1, 66, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02'),
(370, 1, 67, 1, 1, 1, 1, '2026-03-01 16:44:02', '2026-03-01 16:44:02');

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

-- --------------------------------------------------------

--
-- Table structure for table `voucher_number_configurations`
--

CREATE TABLE `voucher_number_configurations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `comp_id` bigint(20) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `voucher_type` varchar(50) NOT NULL,
  `prefix` varchar(20) NOT NULL,
  `running_number` int(11) NOT NULL DEFAULT 1,
  `number_length` int(11) NOT NULL DEFAULT 4,
  `reset_frequency` enum('Monthly','Yearly','Never') NOT NULL DEFAULT 'Yearly',
  `last_reset_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `voucher_number_configurations`
--

INSERT INTO `voucher_number_configurations` (`id`, `comp_id`, `location_id`, `voucher_type`, `prefix`, `running_number`, `number_length`, `reset_frequency`, `last_reset_date`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Journal', 'JV', 1, 4, 'Monthly', '2026-02-28', 1, 1, '2025-10-06 07:18:44', '2026-02-28 04:13:08'),
(2, 1, 1, 'Opening', 'OP', 1, 4, 'Monthly', '2026-02-28', 1, 1, '2025-10-06 07:18:44', '2026-02-28 05:09:55'),
(3, 1, 1, 'Payment', 'PV', 1, 4, 'Monthly', NULL, 1, 1, '2026-03-01 16:29:07', '2026-03-01 16:29:07'),
(4, 1, 1, 'Receipt', 'RV', 1, 4, 'Monthly', NULL, 1, 1, '2026-03-01 16:29:19', '2026-03-01 16:29:19'),
(5, 1, 1, 'Bank Payment', 'BPV', 3, 4, 'Never', NULL, 1, 1, '2026-03-01 16:34:46', '2026-03-01 16:36:46'),
(6, 1, 1, 'Cash Receipt', 'CRV', 7, 4, 'Never', NULL, 1, 1, '2026-03-01 16:54:10', '2026-03-01 17:01:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_configurations`
--
ALTER TABLE `account_configurations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_acct_config` (`comp_id`,`location_id`,`account_id`,`config_type`),
  ADD KEY `account_configurations_comp_id_location_id_config_type_index` (`comp_id`,`location_id`,`config_type`),
  ADD KEY `account_configurations_account_id_config_type_index` (`account_id`,`config_type`),
  ADD KEY `account_configurations_is_active_index` (`is_active`);

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
  ADD KEY `chart_of_accounts_is_transactional_index` (`is_transactional`);

--
-- Indexes for table `code_configurations`
--
ALTER TABLE `code_configurations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_code_config` (`company_id`,`location_id`,`code_type`),
  ADD KEY `code_configurations_location_id_foreign` (`location_id`),
  ADD KEY `code_configurations_created_by_foreign` (`created_by`),
  ADD KEY `code_configurations_updated_by_foreign` (`updated_by`),
  ADD KEY `code_configurations_level2_account_id_index` (`level2_account_id`),
  ADD KEY `code_configurations_level3_account_id_index` (`level3_account_id`);

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
-- Indexes for table `currency_exchange_rate_history`
--
ALTER TABLE `currency_exchange_rate_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `currency_exchange_rate_history_currency_id_effective_date_index` (`currency_id`,`effective_date`),
  ADD KEY `currency_exchange_rate_history_source_index` (`source`),
  ADD KEY `currency_exchange_rate_history_created_at_index` (`created_at`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `departments_location_id_department_name_unique` (`location_id`,`department_name`),
  ADD KEY `departments_company_id_foreign` (`company_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `fiscal_periods`
--
ALTER TABLE `fiscal_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fiscal_periods_comp_id_fiscal_year_period_number_unique` (`comp_id`,`fiscal_year`,`period_number`),
  ADD KEY `fiscal_periods_comp_id_fiscal_year_index` (`comp_id`,`fiscal_year`),
  ADD KEY `fiscal_periods_comp_id_status_index` (`comp_id`,`status`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `tbl_audit_logs`
--
ALTER TABLE `tbl_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tbl_audit_logs_user_id_index` (`user_id`),
  ADD KEY `tbl_audit_logs_company_id_index` (`company_id`),
  ADD KEY `tbl_audit_logs_table_name_record_id_index` (`table_name`,`record_id`),
  ADD KEY `tbl_audit_logs_created_at_index` (`created_at`),
  ADD KEY `tbl_audit_logs_action_type_index` (`action_type`),
  ADD KEY `tbl_audit_logs_module_name_index` (`module_name`);

--
-- Indexes for table `tbl_change_history`
--
ALTER TABLE `tbl_change_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tbl_change_history_table_name_record_id_index` (`table_name`,`record_id`),
  ADD KEY `tbl_change_history_field_name_index` (`field_name`),
  ADD KEY `tbl_change_history_changed_at_index` (`changed_at`),
  ADD KEY `tbl_change_history_changed_by_index` (`changed_by`);

--
-- Indexes for table `tbl_deleted_data_recovery`
--
ALTER TABLE `tbl_deleted_data_recovery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tbl_deleted_data_recovery_original_table_original_id_index` (`original_table`,`original_id`),
  ADD KEY `tbl_deleted_data_recovery_record_identifier_index` (`record_identifier`),
  ADD KEY `tbl_deleted_data_recovery_status_index` (`status`),
  ADD KEY `tbl_deleted_data_recovery_recovery_expires_at_index` (`recovery_expires_at`),
  ADD KEY `tbl_deleted_data_recovery_deleted_at_index` (`deleted_at`);

--
-- Indexes for table `tbl_report_logs`
--
ALTER TABLE `tbl_report_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tbl_report_logs_user_id_index` (`user_id`),
  ADD KEY `tbl_report_logs_report_name_index` (`report_name`),
  ADD KEY `tbl_report_logs_created_at_index` (`created_at`);

--
-- Indexes for table `tbl_security_logs`
--
ALTER TABLE `tbl_security_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tbl_security_logs_user_id_index` (`user_id`),
  ADD KEY `tbl_security_logs_username_index` (`username`),
  ADD KEY `tbl_security_logs_event_type_index` (`event_type`),
  ADD KEY `tbl_security_logs_event_status_index` (`event_status`),
  ADD KEY `tbl_security_logs_risk_level_index` (`risk_level`),
  ADD KEY `tbl_security_logs_created_at_index` (`created_at`);

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
-- Indexes for table `tbl_user_activity_logs`
--
ALTER TABLE `tbl_user_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tbl_user_activity_logs_user_id_index` (`user_id`),
  ADD KEY `tbl_user_activity_logs_session_id_index` (`session_id`),
  ADD KEY `tbl_user_activity_logs_route_name_index` (`route_name`),
  ADD KEY `tbl_user_activity_logs_created_at_index` (`created_at`);

--
-- Indexes for table `temp_level3_mapping`
--
ALTER TABLE `temp_level3_mapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `temp_level3_mapping_old_parent_id_index` (`old_parent_id`),
  ADD KEY `temp_level3_mapping_new_parent_id_index` (`new_parent_id`),
  ADD KEY `temp_level3_mapping_level4_account_id_index` (`level4_account_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_voucher_number_unique` (`voucher_number`),
  ADD KEY `transactions_comp_id_location_id_index` (`comp_id`,`location_id`),
  ADD KEY `transactions_voucher_type_index` (`voucher_type`),
  ADD KEY `transactions_status_index` (`status`),
  ADD KEY `transactions_voucher_date_index` (`voucher_date`),
  ADD KEY `transactions_created_by_index` (`created_by`),
  ADD KEY `transactions_fiscal_year_index` (`fiscal_year`),
  ADD KEY `transactions_bank_account_id_index` (`bank_account_id`);

--
-- Indexes for table `transaction_entries`
--
ALTER TABLE `transaction_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_entries_transaction_id_index` (`transaction_id`),
  ADD KEY `transaction_entries_account_id_index` (`account_id`),
  ADD KEY `transaction_entries_comp_id_location_id_index` (`comp_id`,`location_id`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_rights_user_id_foreign` (`user_id`);

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
-- Indexes for table `voucher_number_configurations`
--
ALTER TABLE `voucher_number_configurations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `voucher_config_comp_loc_type_idx` (`comp_id`,`location_id`,`voucher_type`),
  ADD KEY `voucher_config_type_idx` (`voucher_type`),
  ADD KEY `voucher_config_active_idx` (`is_active`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_configurations`
--
ALTER TABLE `account_configurations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=243;

--
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=366;

--
-- AUTO_INCREMENT for table `code_configurations`
--
ALTER TABLE `code_configurations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `currency_exchange_rate_history`
--
ALTER TABLE `currency_exchange_rate_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fiscal_periods`
--
ALTER TABLE `fiscal_periods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=485;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `tbl_audit_logs`
--
ALTER TABLE `tbl_audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tbl_change_history`
--
ALTER TABLE `tbl_change_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_deleted_data_recovery`
--
ALTER TABLE `tbl_deleted_data_recovery`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_report_logs`
--
ALTER TABLE `tbl_report_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_security_logs`
--
ALTER TABLE `tbl_security_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tbl_user_activity_logs`
--
ALTER TABLE `tbl_user_activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `temp_level3_mapping`
--
ALTER TABLE `temp_level3_mapping`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `transaction_entries`
--
ALTER TABLE `transaction_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_rights`
--
ALTER TABLE `user_rights`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=371;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `voucher_number_configurations`
--
ALTER TABLE `voucher_number_configurations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD CONSTRAINT `chart_of_accounts_parent_account_id_foreign` FOREIGN KEY (`parent_account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `code_configurations`
--
ALTER TABLE `code_configurations`
  ADD CONSTRAINT `code_configurations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `code_configurations_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `code_configurations_level2_account_id_foreign` FOREIGN KEY (`level2_account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `code_configurations_level3_account_id_foreign` FOREIGN KEY (`level3_account_id`) REFERENCES `chart_of_accounts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `code_configurations_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `code_configurations_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `companies_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `companies_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `tbl_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `currency_exchange_rate_history`
--
ALTER TABLE `currency_exchange_rate_history`
  ADD CONSTRAINT `currency_exchange_rate_history_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `chart_of_accounts` (`id`);

--
-- Constraints for table `transaction_entries`
--
ALTER TABLE `transaction_entries`
  ADD CONSTRAINT `transaction_entries_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`);

--
-- Constraints for table `user_rights`
--
ALTER TABLE `user_rights`
  ADD CONSTRAINT `user_rights_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
