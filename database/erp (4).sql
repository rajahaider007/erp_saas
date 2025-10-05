-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 05, 2025 at 10:06 AM
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
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
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
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
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
(40, 1, 7, 'Modules', '/system/AddModules', 'settings', 1, 1, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(41, 1, 7, 'Sections', '/system/sections', 'layers', 1, 2, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(42, 1, 7, 'Menus', '/system/menus', 'list', 1, 3, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(43, 1, 7, 'Packages', '/system/packages', 'package', 1, 4, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(44, 1, 7, 'Package Features', '/system/package-features', 'layers', 1, 5, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(45, 1, 7, 'Locations', '/system/locations', 'building', 1, 6, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(46, 1, 7, 'Departments', '/system/departments', 'users', 1, 7, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(47, 1, 7, 'Companies', '/system/companies', 'building-2', 1, 8, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(48, 1, 7, 'Users', '/system/users', 'users', 1, 9, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL),
(49, 1, 7, 'new', NULL, NULL, 1, 5, '2025-09-26 13:07:28', '2025-10-05 03:02:55', '2025-10-05 03:02:55'),
(50, 1, 7, 'test', 'test', 'test', 1, 10, '2025-10-05 03:02:42', '2025-10-05 03:02:48', '2025-10-05 03:02:48');

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
(29, '2025_10_05_070440_create_user_rights_table', 14);

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
(1, 'System (Admin Panel)', 'system', 'system-admin-panel', NULL, 1, 1, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL);

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
(1, 1, 6, 1, '2025-09-14 03:56:01', '2025-09-14 03:56:01'),
(2, 1, 7, 1, '2025-09-14 03:56:01', '2025-09-14 03:56:01'),
(3, 1, 8, 1, '2025-09-14 03:56:01', '2025-09-14 03:56:01'),
(4, 1, 9, 1, '2025-09-14 03:56:01', '2025-09-14 03:56:01'),
(5, 1, 10, 1, '2025-09-14 03:56:01', '2025-09-14 03:56:01'),
(6, 2, 6, 1, '2025-09-14 03:58:31', '2025-09-14 03:58:31'),
(7, 2, 7, 1, '2025-09-14 03:58:31', '2025-09-14 03:58:31'),
(8, 2, 8, 1, '2025-09-14 03:58:31', '2025-09-14 03:58:31'),
(9, 2, 9, 1, '2025-09-14 03:58:31', '2025-09-14 03:58:31'),
(10, 2, 10, 1, '2025-09-14 03:58:31', '2025-09-14 03:58:31'),
(11, 3, 6, 1, '2025-09-14 03:58:39', '2025-09-14 03:58:39'),
(12, 3, 7, 1, '2025-09-14 03:58:39', '2025-09-14 03:58:39'),
(13, 3, 8, 1, '2025-09-14 03:58:39', '2025-09-14 03:58:39'),
(14, 3, 9, 1, '2025-09-14 03:58:39', '2025-09-14 03:58:39'),
(15, 3, 10, 1, '2025-09-14 03:58:39', '2025-09-14 03:58:39');

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
(7, 1, 'Configuration', 'configuration', 1, 1, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL);

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
(1, 'System', NULL, 'Administrator', 'admin@erpsystem.com', '+1234567890', 'admin', '12345', 11, 1, 1, NULL, '$2y$12$QZ/KZc6V/wK3YGJDrzVLaehK4R7EU.wRkOugBu/7kgg47SxX3yHPm', 'f9bb13bea372d3c7005ca92ca5796e18bb0fbbf7639c927e973d5d86765b5237', 'kPr6fz7a5ML1jMSpAZNO7T9SEsBuPwQonwGJImdArGWZ6MXD3cX3HiqdejjpVYGoDCHFH4b5FqVkFakkJbRVYy2f4VPK7RLmfijJ', 'active', 'super_admin', '{\"users\":[\"create\",\"read\",\"update\",\"delete\"],\"financial\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"create\",\"read\",\"update\",\"delete\"],\"settings\":[\"create\",\"read\",\"update\",\"delete\"],\"system\":[\"create\",\"read\",\"update\",\"delete\"]}', NULL, 'UTC', 'en', 'USD', 'system', '2025-10-05 01:39:09', '127.0.0.1', 0, NULL, 0, NULL, NULL, 'auOwxLZ7LU8BQuT6CH8Pbp9JeUqTHhIPYBeaKigb', NULL, 0, '2025-08-14 10:19:49', '[{\"timestamp\":\"2025-10-05T06:39:09.658910Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-26T18:06:08.357458Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-14T10:59:01.712644Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/137.0.0.0 Safari\\/537.36 OPR\\/121.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-14T10:47:55.799115Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/137.0.0.0 Safari\\/537.36 OPR\\/121.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-14T10:26:22.924384Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/137.0.0.0 Safari\\/537.36 OPR\\/121.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-14T10:21:59.690292Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/137.0.0.0 Safari\\/537.36 OPR\\/121.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-14T06:20:13.946962Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/137.0.0.0 Safari\\/537.36 OPR\\/121.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-07T13:25:13.553050Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-07T12:33:52.351347Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-09-07T11:40:07.362843Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-29T15:37:40.891774Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-29T15:20:54.114036Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-29T15:19:28.567732Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-29T14:45:34.046684Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-26T15:08:19.937574Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-26T14:43:26.804782Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-16T06:04:40.987780Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-14T15:23:38.218569Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true},{\"timestamp\":\"2025-08-14T15:22:44.632761Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/135.0.0.0 Safari\\/537.36 OPR\\/120.0.0.0\",\"success\":true}]', NULL, NULL, '2025-08-14 10:19:49', '2025-10-05 03:01:20', NULL, NULL),
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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_rights_user_id_menu_id_unique` (`user_id`,`menu_id`),
  ADD KEY `user_rights_menu_id_foreign` (`menu_id`);

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
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `package_features`
--
ALTER TABLE `package_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `user_rights_menu_id_foreign` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_rights_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
