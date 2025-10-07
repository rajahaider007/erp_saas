-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 06, 2025 at 07:05 PM
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
  `account_code` varchar(15) NOT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_type` enum('Assets','Liabilities','Equity','Revenue','Expenses') NOT NULL,
  `parent_account_id` bigint(20) UNSIGNED DEFAULT NULL,
  `account_level` tinyint(4) NOT NULL DEFAULT 1,
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

INSERT INTO `chart_of_accounts` (`id`, `account_code`, `account_name`, `account_type`, `parent_account_id`, `account_level`, `currency`, `status`, `created_at`, `updated_at`, `short_code`, `comp_id`, `location_id`) VALUES
(1, '100000000000000', 'Assets', 'Assets', NULL, 1, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(2, '100010000000000', 'Current Assets', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(3, '100020000000000', 'Fixed Assets', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(4, '100030000000000', 'Intangible Assets', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(5, '100040000000000', 'Investments', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(6, '100050000000000', 'Other Assets', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(7, '100010000000001', 'Cash in Hand', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(8, '100010000000002', 'Petty Cash', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(9, '100010000000003', 'Bank Accounts', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(10, '100010000000004', 'Accounts Receivable', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(11, '100010000000005', 'Inventory', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(12, '100010000000006', 'Prepaid Expenses', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(13, '100020000000001', 'Land', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(14, '100020000000002', 'Buildings', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(15, '100020000000003', 'Machinery', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(16, '100020000000004', 'Furniture and Fixtures', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(17, '100020000000005', 'Vehicles', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(18, '100030000000001', 'Goodwill', 'Assets', 4, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(19, '100030000000002', 'Software Licenses', 'Assets', 4, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(20, '100030000000003', 'Patents and Trademarks', 'Assets', 4, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(21, '100040000000001', 'Long-term Investments', 'Assets', 5, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(22, '100040000000002', 'Short-term Investments', 'Assets', 5, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(23, '100050000000001', 'Deferred Tax Asset', 'Assets', 6, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(24, '100050000000002', 'Security Deposits', 'Assets', 6, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(25, '100050000000003', 'Employee Advances', 'Assets', 6, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 11, 1),
(26, '200000000000000', 'Liabilities', 'Liabilities', NULL, 1, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(27, '200010000000000', 'Current Liabilities', 'Liabilities', 26, 2, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(28, '200020000000000', 'Long-term Liabilities', 'Liabilities', 26, 2, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(29, '200030000000000', 'Provisions', 'Liabilities', 26, 2, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(30, '200040000000000', 'Deferred Liabilities', 'Liabilities', 26, 2, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(31, '200010000000001', 'Accounts Payable', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(32, '200010000000002', 'Accrued Expenses', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(33, '200010000000003', 'Short-term Loans', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(34, '200010000000004', 'Taxes Payable', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(35, '200010000000005', 'Wages Payable', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(36, '200010000000006', 'Interest Payable', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(37, '200020000000001', 'Bank Loans', 'Liabilities', 28, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(38, '200020000000002', 'Lease Obligations', 'Liabilities', 28, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(39, '200020000000003', 'Bonds Payable', 'Liabilities', 28, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(40, '200020000000004', 'Mortgage Payable', 'Liabilities', 28, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(41, '200030000000001', 'Provision for Income Tax', 'Liabilities', 29, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(42, '200030000000002', 'Provision for Bonus', 'Liabilities', 29, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(43, '200030000000003', 'Provision for Gratuity', 'Liabilities', 29, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(44, '200040000000001', 'Deferred Tax Liability', 'Liabilities', 30, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(45, '200040000000002', 'Deferred Revenue', 'Liabilities', 30, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 11, 1),
(62, '300000000000000', 'Equity', 'Equity', NULL, 1, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(63, '300010000000000', 'Share Capital', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(64, '300020000000000', 'Reserves and Surplus', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(65, '300030000000000', 'Retained Earnings', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(66, '300040000000000', 'Owner’s / Partner’s Capital', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(67, '300050000000000', 'Drawings / Withdrawals', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(68, '300060000000000', 'Other Comprehensive Income (OCI)', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(69, '300010000000001', 'Authorized Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(70, '300010000000002', 'Issued Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(71, '300010000000003', 'Subscribed Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(72, '300010000000004', 'Paid-up Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(73, '300010000000005', 'Preference Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(74, '300010000000006', 'Ordinary Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(75, '300010000000007', 'Treasury Shares', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(76, '300020000000001', 'General Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(77, '300020000000002', 'Capital Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(78, '300020000000003', 'Revaluation Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(79, '300020000000004', 'Share Premium Account', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(80, '300020000000005', 'Statutory Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(81, '300020000000006', 'Investment Fluctuation Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(82, '300020000000007', 'Foreign Currency Translation Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(83, '300030000000001', 'Opening Retained Earnings', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(84, '300030000000002', 'Current Year Profit', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(85, '300030000000003', 'Prior Period Adjustments', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(86, '300030000000004', 'Transferred to Reserves', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(87, '300030000000005', 'Accumulated Profits', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(88, '300040000000001', 'Owner’s Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(89, '300040000000002', 'Partner A Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(90, '300040000000003', 'Partner B Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(91, '300040000000004', 'Director Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(92, '300040000000005', 'Proprietor Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(93, '300050000000001', 'Owner Drawings', 'Equity', 67, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(94, '300050000000002', 'Partner Drawings', 'Equity', 67, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(95, '300050000000003', 'Director Drawings', 'Equity', 67, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(96, '300050000000004', 'Personal Expenses (Non-Business)', 'Equity', 67, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(97, '300060000000001', 'Unrealized Gain on Investments', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(98, '300060000000002', 'Unrealized Loss on Investments', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(99, '300060000000003', 'Fair Value Adjustment', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(100, '300060000000004', 'Actuarial Gains / Losses on Pensions', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(101, '300060000000005', 'Currency Translation Differences (OCI)', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 11, 1),
(102, '400000000000000', 'Revenue', 'Revenue', NULL, 1, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(103, '400010000000000', 'Operating Revenue', 'Revenue', 102, 2, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(104, '400020000000000', 'Non-Operating Revenue', 'Revenue', 102, 2, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(105, '400030000000000', 'Other Income', 'Revenue', 102, 2, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(106, '400040000000000', 'Discounts & Rebates', 'Revenue', 102, 2, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(107, '400010000000001', 'Sales Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(108, '400010000000002', 'Service Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(109, '400010000000003', 'Product Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(110, '400010000000004', 'Rental Income', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(111, '400010000000005', 'Maintenance Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(112, '400010000000006', 'Subscription Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(113, '400010000000007', 'Commission Income', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(114, '400010000000008', 'Consultancy Income', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(115, '400020000000001', 'Interest Income', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(116, '400020000000002', 'Dividend Income', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(117, '400020000000003', 'Gain on Sale of Assets', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(118, '400020000000004', 'Foreign Exchange Gain', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(119, '400020000000005', 'Investment Income', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(120, '400020000000006', 'Royalty Income', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(121, '400030000000001', 'Miscellaneous Income', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(122, '400030000000002', 'Scrap Sales', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(123, '400030000000003', 'Insurance Claim Received', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(124, '400030000000004', 'Rebate Received', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(125, '400030000000005', 'Refunds & Adjustments', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(126, '400030000000006', 'Grant Income', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(127, '400040000000001', 'Sales Discounts', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(128, '400040000000002', 'Early Payment Discounts', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(129, '400040000000003', 'Customer Rebates', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(130, '400040000000004', 'Trade Discounts', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(131, '400040000000005', 'Loyalty Program Discounts', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 11, 1),
(132, '500000000000000', 'Expenses', 'Expenses', NULL, 1, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(133, '500010000000000', 'Cost of Goods Sold', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(134, '500020000000000', 'Administrative Expenses', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(135, '500030000000000', 'Selling & Distribution Expenses', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(136, '500040000000000', 'Financial Expenses', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(137, '500050000000000', 'Other Expenses', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(138, '500010000000001', 'Raw Material Consumed', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(139, '500010000000002', 'Purchases', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(140, '500010000000003', 'Purchase Returns', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(141, '500010000000004', 'Freight Inward', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(142, '500010000000005', 'Packing Materials', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(143, '500010000000006', 'Factory Wages', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(144, '500010000000007', 'Factory Rent', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(145, '500010000000008', 'Depreciation - Factory Equipment', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(146, '500010000000009', 'Power and Fuel', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(147, '500010000000010', 'Direct Labor', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(148, '500020000000001', 'Office Salaries', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(149, '500020000000002', 'Office Rent', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(150, '500020000000003', 'Utilities', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(151, '500020000000004', 'Stationery & Office Supplies', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(152, '500020000000005', 'Printing & Postage', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(153, '500020000000006', 'IT & Internet Expenses', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(154, '500020000000007', 'Repairs & Maintenance', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(155, '500020000000008', 'Depreciation - Office Equipment', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(156, '500020000000009', 'Professional Fees', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(157, '500020000000010', 'Travel & Conveyance', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(158, '500030000000001', 'Advertising & Promotion', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(159, '500030000000002', 'Sales Commission', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(160, '500030000000003', 'Freight Outward', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(161, '500030000000004', 'Delivery & Transportation', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(162, '500030000000005', 'Sales Staff Salaries', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(163, '500030000000006', 'Showroom Expenses', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(164, '500030000000007', 'Discount Allowed', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(165, '500030000000008', 'Promotional Samples', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(166, '500030000000009', 'After-Sales Service', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(167, '500030000000010', 'Trade Show Expenses', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(168, '500040000000001', 'Bank Charges', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(169, '500040000000002', 'Interest Expense', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(170, '500040000000003', 'Loan Processing Fees', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(171, '500040000000004', 'Foreign Exchange Loss', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(172, '500040000000005', 'Credit Card Fees', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(173, '500040000000006', 'Bank Overdraft Interest', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(174, '500050000000001', 'Bad Debts', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(175, '500050000000002', 'Depreciation - Other Assets', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(176, '500050000000003', 'Amortization Expense', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(177, '500050000000004', 'Loss on Sale of Assets', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(178, '500050000000005', 'Donations & Contributions', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(179, '500050000000006', 'Penalties & Fines', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(180, '500050000000007', 'Staff Welfare', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(181, '500050000000008', 'Training & Seminars', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1),
(182, '500050000000009', 'Miscellaneous Expenses', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 11, 1);

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

INSERT INTO `companies` (`id`, `company_name`, `company_code`, `legal_name`, `trading_name`, `registration_number`, `tax_id`, `vat_number`, `incorporation_date`, `company_type`, `email`, `phone`, `fax`, `website`, `address_line_1`, `address_line_2`, `city`, `state_province`, `postal_code`, `country`, `timezone`, `industry`, `business_description`, `employee_count`, `annual_revenue`, `currency`, `fiscal_year_start`, `license_number`, `license_expiry`, `compliance_certifications`, `legal_notes`, `bank_name`, `bank_account_number`, `bank_routing_number`, `swift_code`, `iban`, `logo`, `brand_color_primary`, `brand_color_secondary`, `status`, `accounting_vno_auto`, `base_currency`, `settings`, `features`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `package_id`, `license_start_date`, `license_end_date`) VALUES
(11, 'Acme Corporation', 'ACME001', NULL, NULL, 'REG001', NULL, NULL, NULL, 'private_limited', 'contact@acme.com', NULL, NULL, NULL, '123 Main Street', NULL, 'New York', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-10-05 02:40:03', NULL, 3, '2025-10-01', '2026-10-01'),
(12, 'Tech Solutions Inc', 'TECH001', NULL, NULL, 'REG002', NULL, NULL, NULL, 'private_limited', 'info@techsolutions.com', NULL, NULL, NULL, '456 Tech Avenue', NULL, 'San Francisco', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(13, 'Global Industries Ltd', 'GLOBAL001', NULL, NULL, 'REG003', NULL, NULL, NULL, 'private_limited', 'contact@globalindustries.com', NULL, NULL, NULL, '789 Business District', NULL, 'London', NULL, NULL, 'United Kingdom', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(14, 'Innovation Hub', 'INNOV001', NULL, NULL, 'REG004', NULL, NULL, NULL, 'private_limited', 'hello@innovationhub.com', NULL, NULL, NULL, '321 Innovation Street', NULL, 'Boston', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(15, 'Enterprise Systems', 'ENT001', NULL, NULL, 'REG005', NULL, NULL, NULL, 'private_limited', 'contact@enterprisesystems.com', NULL, NULL, NULL, '654 Corporate Plaza', NULL, 'Chicago', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 0, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL);

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
(12, 2, 2, 'Chart of Accounts', '/accounts/chart-of-accounts', 'file-text', 1, 2, '2025-10-06 04:23:27', '2025-10-06 08:40:19', NULL),
(13, 2, 2, 'Voucher Number Configuration', '/accounts/voucher-number-configuration', 'settings', 1, 1, '2025-10-06 04:23:27', '2025-10-06 08:40:19', NULL),
(14, 2, 4, 'Journal Voucher', '/accounts/journal-voucher', 'file-text', 1, 1, '2025-10-06 10:22:48', '2025-10-06 10:22:48', NULL);

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
(34, '2025_10_05_175209_update_exchange_rate_precision_in_currencies_table', 18),
(38, '2024_01_15_000001_add_accounting_fields_to_companies_table', 19),
(39, '2024_01_15_000002_create_transactions_table', 19),
(40, '2024_01_15_000003_create_transaction_entries_table', 19),
(41, '2024_01_15_000004_create_voucher_number_configurations_table', 19),
(42, '2024_01_15_000005_fix_menu_structure', 20),
(43, '2025_10_06_134006_update_voucher_menu_routes', 21),
(44, '2025_10_06_152140_add_journal_voucher_menu_to_accounts_module', 22);

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
(21, 2, 1, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(22, 2, 2, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(23, 2, 3, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(24, 2, 4, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(25, 2, 5, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(26, 2, 6, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(27, 2, 7, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(28, 2, 8, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(29, 2, 9, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(30, 2, 10, 1, '2025-10-06 00:29:04', '2025-10-06 00:29:04'),
(41, 1, 1, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(42, 1, 2, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(43, 1, 3, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(44, 1, 4, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(45, 1, 5, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(46, 1, 6, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(47, 1, 7, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(48, 1, 8, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(49, 1, 9, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(50, 1, 10, 1, '2025-10-06 00:29:20', '2025-10-06 00:29:20'),
(62, 3, 1, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(63, 3, 2, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(64, 3, 3, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(65, 3, 4, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(66, 3, 5, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(67, 3, 6, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(68, 3, 7, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(69, 3, 8, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(70, 3, 9, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(71, 3, 12, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(72, 3, 13, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24'),
(73, 3, 14, 1, '2025-10-06 10:53:24', '2025-10-06 10:53:24');

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
(4, 2, 'Account Management', 'account-management', 1, 2, '2025-10-06 07:13:09', '2025-10-06 07:13:09', NULL);

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
(1, 'System', NULL, 'Administrator', 'admin@erpsystem.com', '+1234567890', 'admin', '12345', 11, 1, 1, NULL, '$2y$12$QZ/KZc6V/wK3YGJDrzVLaehK4R7EU.wRkOugBu/7kgg47SxX3yHPm', 'dc83153d050e5614fef86503a3472da508932ac3950312159618b76433194155', 'YfEEvGmqrsGA9VH0yKOb7SFlsvio9zLvvq9euzEJPbVaO2G6VqpkAcgfVb1cI9loDwuEMogK9iQoRPf4Bh8zmpO3J13GsNa358u9', 'active', 'super_admin', '{\"users\":[\"create\",\"read\",\"update\",\"delete\"],\"financial\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"create\",\"read\",\"update\",\"delete\"],\"settings\":[\"create\",\"read\",\"update\",\"delete\"],\"system\":[\"create\",\"read\",\"update\",\"delete\"]}', NULL, 'UTC', 'en', 'USD', 'system', '2025-10-06 11:10:22', '127.0.0.1', 0, NULL, 0, NULL, NULL, 'wx8KH7Sa8iKaQnm15L5GIf9g6vBJmPFM8CZKoKoj', NULL, 0, '2025-08-14 10:19:49', '[{\"timestamp\":\"2025-10-06T16:10:22.267028Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T15:33:26.569522Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T15:19:19.876734Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T13:24:53.090881Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T13:24:15.741629Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T12:03:21.608905Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T11:38:59.768889Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T09:12:35.068673Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T09:11:40.860961Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T09:09:57.731776Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T08:59:32.751032Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T06:34:27.352617Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T05:32:15.292806Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T05:27:42.816357Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T05:13:16.596128Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:21:41.367032Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:20:23.633537Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:19:26.234679Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:14:32.822610Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-05T18:14:24.965821Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true}]', NULL, NULL, '2025-08-14 10:19:49', '2025-10-06 11:10:22', NULL, NULL),
(2, 'Finance', NULL, 'Manager', 'finance@erpsystem.com', '+1234567891', 'finance_mgr', '12346', 1, 1, 2, NULL, '$2y$12$.Kwr9rgMKPjrBG45kDk8x.kTh/l9u1VSLPMZ/BAI0n2Jw69lIf9SG', NULL, NULL, 'active', 'manager', '{\"financial\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"read\",\"create\"],\"users\":[\"read\"]}', NULL, 'UTC', 'en', 'USD', 'light', NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 0, '2025-08-14 10:19:50', NULL, NULL, NULL, '2025-08-14 10:19:50', '2025-08-14 10:19:50', NULL, NULL),
(3, 'Account', NULL, 'Executive', 'accounts@erpsystem.com', '+1234567892', 'acc_exec', '12347', 1, 1, 2, NULL, '$2y$12$voUVJ1fWNi9mo0rkJppxZ.V96Gn0MF.y6L1KSjKBz7tJGp/7/QN3m', NULL, NULL, 'active', 'user', '{\"financial\":[\"create\",\"read\",\"update\"],\"reports\":[\"read\"]}', NULL, 'Asia/Karachi', 'en', 'PKR', 'dark', NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, 1, '2025-05-14 10:19:50', NULL, NULL, NULL, '2025-08-14 10:19:50', '2025-08-14 10:19:50', NULL, NULL);

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
  `reference_number` varchar(100) DEFAULT NULL,
  `description` text NOT NULL,
  `status` enum('Draft','Pending','Approved','Posted','Rejected') NOT NULL DEFAULT 'Draft',
  `total_debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency_code` varchar(3) NOT NULL DEFAULT 'USD',
  `exchange_rate` decimal(10,6) NOT NULL DEFAULT 1.000000,
  `base_currency_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `period_id` bigint(20) UNSIGNED NOT NULL,
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
  `cost_center_id` bigint(20) UNSIGNED DEFAULT NULL,
  `project_id` bigint(20) UNSIGNED DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `comp_id` bigint(20) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(67, 1, 1, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(68, 1, 2, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(69, 1, 3, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(70, 1, 4, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(71, 1, 5, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(72, 1, 6, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(73, 1, 7, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(74, 1, 8, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(75, 1, 9, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(76, 1, 10, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(77, 1, 11, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(78, 1, 12, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(79, 1, 13, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50'),
(80, 1, 14, 1, 1, 1, 1, '2025-10-06 10:53:50', '2025-10-06 10:53:50');

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
(1, 11, 1, 'Journal', 'JV', 1, 4, 'Monthly', NULL, 1, 1, '2025-10-06 07:18:44', '2025-10-06 12:04:34');

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
  ADD KEY `chart_of_accounts_status_index` (`status`);

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
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transactions_voucher_number_unique` (`voucher_number`),
  ADD KEY `transactions_comp_id_location_id_index` (`comp_id`,`location_id`),
  ADD KEY `transactions_voucher_type_index` (`voucher_type`),
  ADD KEY `transactions_status_index` (`status`),
  ADD KEY `transactions_voucher_date_index` (`voucher_date`),
  ADD KEY `transactions_created_by_index` (`created_by`);

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
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaction_entries`
--
ALTER TABLE `transaction_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_rights`
--
ALTER TABLE `user_rights`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `voucher_number_configurations`
--
ALTER TABLE `voucher_number_configurations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- Constraints for table `transaction_entries`
--
ALTER TABLE `transaction_entries`
  ADD CONSTRAINT `transaction_entries_account_id_foreign` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`id`),
  ADD CONSTRAINT `transaction_entries_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_rights`
--
ALTER TABLE `user_rights`
  ADD CONSTRAINT `user_rights_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
