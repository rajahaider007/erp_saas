-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 10, 2025 at 07:26 PM
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

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-active_currencies', 'a:100:{i:0;a:5:{s:5:\"value\";s:3:\"USD\";s:5:\"label\";s:28:\"United States Dollarss (USD)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:6:\"1.0000\";s:7:\"country\";s:13:\"United States\";}i:1;a:5:{s:5:\"value\";s:3:\"EUR\";s:5:\"label\";s:10:\"Euro (EUR)\";s:6:\"symbol\";s:3:\"€\";s:13:\"exchange_rate\";s:6:\"0.8540\";s:7:\"country\";s:14:\"European Union\";}i:2;a:5:{s:5:\"value\";s:3:\"GBP\";s:5:\"label\";s:28:\"British Pound Sterling (GBP)\";s:6:\"symbol\";s:2:\"£\";s:13:\"exchange_rate\";s:6:\"0.7420\";s:7:\"country\";s:14:\"United Kingdom\";}i:3;a:5:{s:5:\"value\";s:3:\"JPY\";s:5:\"label\";s:18:\"Japanese Yen (JPY)\";s:6:\"symbol\";s:2:\"¥\";s:13:\"exchange_rate\";s:8:\"150.0200\";s:7:\"country\";s:5:\"Japan\";}i:4;a:5:{s:5:\"value\";s:3:\"CHF\";s:5:\"label\";s:17:\"Swiss Franc (CHF)\";s:6:\"symbol\";s:3:\"CHF\";s:13:\"exchange_rate\";s:6:\"0.7960\";s:7:\"country\";s:11:\"Switzerland\";}i:5;a:5:{s:5:\"value\";s:3:\"CAD\";s:5:\"label\";s:21:\"Canadian Dollar (CAD)\";s:6:\"symbol\";s:2:\"C$\";s:13:\"exchange_rate\";s:6:\"1.4000\";s:7:\"country\";s:6:\"Canada\";}i:6;a:5:{s:5:\"value\";s:3:\"AUD\";s:5:\"label\";s:23:\"Australian Dollar (AUD)\";s:6:\"symbol\";s:2:\"A$\";s:13:\"exchange_rate\";s:6:\"1.5100\";s:7:\"country\";s:9:\"Australia\";}i:7;a:5:{s:5:\"value\";s:3:\"NZD\";s:5:\"label\";s:24:\"New Zealand Dollar (NZD)\";s:6:\"symbol\";s:3:\"NZ$\";s:13:\"exchange_rate\";s:6:\"1.7100\";s:7:\"country\";s:11:\"New Zealand\";}i:8;a:5:{s:5:\"value\";s:3:\"CNY\";s:5:\"label\";s:18:\"Chinese Yuan (CNY)\";s:6:\"symbol\";s:2:\"¥\";s:13:\"exchange_rate\";s:6:\"7.1300\";s:7:\"country\";s:5:\"China\";}i:9;a:5:{s:5:\"value\";s:3:\"HKD\";s:5:\"label\";s:22:\"Hong Kong Dollar (HKD)\";s:6:\"symbol\";s:3:\"HK$\";s:13:\"exchange_rate\";s:6:\"7.7800\";s:7:\"country\";s:9:\"Hong Kong\";}i:10;a:5:{s:5:\"value\";s:3:\"SGD\";s:5:\"label\";s:22:\"Singapore Dollar (SGD)\";s:6:\"symbol\";s:2:\"S$\";s:13:\"exchange_rate\";s:6:\"1.2900\";s:7:\"country\";s:9:\"Singapore\";}i:11;a:5:{s:5:\"value\";s:3:\"KRW\";s:5:\"label\";s:22:\"South Korean Won (KRW)\";s:6:\"symbol\";s:3:\"₩\";s:13:\"exchange_rate\";s:9:\"1410.7200\";s:7:\"country\";s:11:\"South Korea\";}i:12;a:5:{s:5:\"value\";s:3:\"INR\";s:5:\"label\";s:18:\"Indian Rupee (INR)\";s:6:\"symbol\";s:3:\"₹\";s:13:\"exchange_rate\";s:7:\"88.7800\";s:7:\"country\";s:5:\"India\";}i:13;a:5:{s:5:\"value\";s:3:\"PKR\";s:5:\"label\";s:21:\"Pakistani Rupee (PKR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:8:\"283.2500\";s:7:\"country\";s:8:\"Pakistan\";}i:14;a:5:{s:5:\"value\";s:3:\"BDT\";s:5:\"label\";s:22:\"Bangladeshi Taka (BDT)\";s:6:\"symbol\";s:3:\"৳\";s:13:\"exchange_rate\";s:8:\"121.7500\";s:7:\"country\";s:10:\"Bangladesh\";}i:15;a:5:{s:5:\"value\";s:3:\"LKR\";s:5:\"label\";s:22:\"Sri Lankan Rupee (LKR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:8:\"302.3200\";s:7:\"country\";s:9:\"Sri Lanka\";}i:16;a:5:{s:5:\"value\";s:3:\"NPR\";s:5:\"label\";s:20:\"Nepalese Rupee (NPR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:8:\"142.0500\";s:7:\"country\";s:5:\"Nepal\";}i:17;a:5:{s:5:\"value\";s:3:\"THB\";s:5:\"label\";s:15:\"Thai Baht (THB)\";s:6:\"symbol\";s:3:\"฿\";s:13:\"exchange_rate\";s:7:\"32.4200\";s:7:\"country\";s:8:\"Thailand\";}i:18;a:5:{s:5:\"value\";s:3:\"MYR\";s:5:\"label\";s:23:\"Malaysian Ringgit (MYR)\";s:6:\"symbol\";s:2:\"RM\";s:13:\"exchange_rate\";s:6:\"4.2100\";s:7:\"country\";s:8:\"Malaysia\";}i:19;a:5:{s:5:\"value\";s:3:\"IDR\";s:5:\"label\";s:23:\"Indonesian Rupiah (IDR)\";s:6:\"symbol\";s:2:\"Rp\";s:13:\"exchange_rate\";s:10:\"16600.5900\";s:7:\"country\";s:9:\"Indonesia\";}i:20;a:5:{s:5:\"value\";s:3:\"PHP\";s:5:\"label\";s:21:\"Philippine Peso (PHP)\";s:6:\"symbol\";s:3:\"₱\";s:13:\"exchange_rate\";s:7:\"58.2800\";s:7:\"country\";s:11:\"Philippines\";}i:21;a:5:{s:5:\"value\";s:3:\"VND\";s:5:\"label\";s:21:\"Vietnamese Dong (VND)\";s:6:\"symbol\";s:3:\"₫\";s:13:\"exchange_rate\";s:10:\"26245.6700\";s:7:\"country\";s:7:\"Vietnam\";}i:22;a:5:{s:5:\"value\";s:3:\"AED\";s:5:\"label\";s:16:\"UAE Dirham (AED)\";s:6:\"symbol\";s:5:\"د.إ\";s:13:\"exchange_rate\";s:6:\"3.6700\";s:7:\"country\";s:20:\"United Arab Emirates\";}i:23;a:5:{s:5:\"value\";s:3:\"SAR\";s:5:\"label\";s:17:\"Saudi Riyal (SAR)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:6:\"3.7500\";s:7:\"country\";s:12:\"Saudi Arabia\";}i:24;a:5:{s:5:\"value\";s:3:\"QAR\";s:5:\"label\";s:18:\"Qatari Riyal (QAR)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:6:\"3.6400\";s:7:\"country\";s:5:\"Qatar\";}i:25;a:5:{s:5:\"value\";s:3:\"KWD\";s:5:\"label\";s:19:\"Kuwaiti Dinar (KWD)\";s:6:\"symbol\";s:5:\"د.ك\";s:13:\"exchange_rate\";s:6:\"0.3060\";s:7:\"country\";s:6:\"Kuwait\";}i:26;a:5:{s:5:\"value\";s:3:\"BHD\";s:5:\"label\";s:20:\"Bahraini Dinar (BHD)\";s:6:\"symbol\";s:5:\"د.ب\";s:13:\"exchange_rate\";s:6:\"0.3760\";s:7:\"country\";s:7:\"Bahrain\";}i:27;a:5:{s:5:\"value\";s:3:\"OMR\";s:5:\"label\";s:16:\"Omani Rial (OMR)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:6:\"0.3840\";s:7:\"country\";s:4:\"Oman\";}i:28;a:5:{s:5:\"value\";s:3:\"JOD\";s:5:\"label\";s:21:\"Jordanian Dinar (JOD)\";s:6:\"symbol\";s:5:\"د.ا\";s:13:\"exchange_rate\";s:6:\"0.7090\";s:7:\"country\";s:6:\"Jordan\";}i:29;a:5:{s:5:\"value\";s:3:\"LBP\";s:5:\"label\";s:20:\"Lebanese Pound (LBP)\";s:6:\"symbol\";s:5:\"ل.ل\";s:13:\"exchange_rate\";s:10:\"89500.0000\";s:7:\"country\";s:7:\"Lebanon\";}i:30;a:5:{s:5:\"value\";s:3:\"EGP\";s:5:\"label\";s:20:\"Egyptian Pound (EGP)\";s:6:\"symbol\";s:2:\"£\";s:13:\"exchange_rate\";s:7:\"47.6100\";s:7:\"country\";s:5:\"Egypt\";}i:31;a:5:{s:5:\"value\";s:3:\"ZAR\";s:5:\"label\";s:24:\"South African Rand (ZAR)\";s:6:\"symbol\";s:1:\"R\";s:13:\"exchange_rate\";s:7:\"17.2000\";s:7:\"country\";s:12:\"South Africa\";}i:32;a:5:{s:5:\"value\";s:3:\"NGN\";s:5:\"label\";s:20:\"Nigerian Naira (NGN)\";s:6:\"symbol\";s:3:\"₦\";s:13:\"exchange_rate\";s:9:\"1463.5500\";s:7:\"country\";s:7:\"Nigeria\";}i:33;a:5:{s:5:\"value\";s:3:\"KES\";s:5:\"label\";s:21:\"Kenyan Shilling (KES)\";s:6:\"symbol\";s:3:\"KSh\";s:13:\"exchange_rate\";s:8:\"129.1100\";s:7:\"country\";s:5:\"Kenya\";}i:34;a:5:{s:5:\"value\";s:3:\"GHS\";s:5:\"label\";s:19:\"Ghanaian Cedi (GHS)\";s:6:\"symbol\";s:3:\"₵\";s:13:\"exchange_rate\";s:7:\"12.6100\";s:7:\"country\";s:5:\"Ghana\";}i:35;a:5:{s:5:\"value\";s:3:\"SEK\";s:5:\"label\";s:19:\"Swedish Krona (SEK)\";s:6:\"symbol\";s:2:\"kr\";s:13:\"exchange_rate\";s:6:\"9.3800\";s:7:\"country\";s:6:\"Sweden\";}i:36;a:5:{s:5:\"value\";s:3:\"NOK\";s:5:\"label\";s:21:\"Norwegian Krone (NOK)\";s:6:\"symbol\";s:2:\"kr\";s:13:\"exchange_rate\";s:6:\"9.9300\";s:7:\"country\";s:6:\"Norway\";}i:37;a:5:{s:5:\"value\";s:3:\"DKK\";s:5:\"label\";s:18:\"Danish Krone (DKK)\";s:6:\"symbol\";s:2:\"kr\";s:13:\"exchange_rate\";s:6:\"6.3700\";s:7:\"country\";s:7:\"Denmark\";}i:38;a:5:{s:5:\"value\";s:3:\"PLN\";s:5:\"label\";s:18:\"Polish Zloty (PLN)\";s:6:\"symbol\";s:3:\"zł\";s:13:\"exchange_rate\";s:6:\"3.6300\";s:7:\"country\";s:6:\"Poland\";}i:39;a:5:{s:5:\"value\";s:3:\"CZK\";s:5:\"label\";s:18:\"Czech Koruna (CZK)\";s:6:\"symbol\";s:3:\"Kč\";s:13:\"exchange_rate\";s:7:\"20.7800\";s:7:\"country\";s:14:\"Czech Republic\";}i:40;a:5:{s:5:\"value\";s:3:\"HUF\";s:5:\"label\";s:22:\"Hungarian Forint (HUF)\";s:6:\"symbol\";s:2:\"Ft\";s:13:\"exchange_rate\";s:8:\"332.0100\";s:7:\"country\";s:7:\"Hungary\";}i:41;a:5:{s:5:\"value\";s:3:\"RON\";s:5:\"label\";s:18:\"Romanian Leu (RON)\";s:6:\"symbol\";s:3:\"lei\";s:13:\"exchange_rate\";s:6:\"4.3500\";s:7:\"country\";s:7:\"Romania\";}i:42;a:5:{s:5:\"value\";s:3:\"BGN\";s:5:\"label\";s:19:\"Bulgarian Lev (BGN)\";s:6:\"symbol\";s:4:\"лв\";s:13:\"exchange_rate\";s:6:\"1.6700\";s:7:\"country\";s:8:\"Bulgaria\";}i:43;a:5:{s:5:\"value\";s:3:\"HRK\";s:5:\"label\";s:19:\"Croatian Kuna (HRK)\";s:6:\"symbol\";s:2:\"kn\";s:13:\"exchange_rate\";s:6:\"6.4400\";s:7:\"country\";s:7:\"Croatia\";}i:44;a:5:{s:5:\"value\";s:3:\"RSD\";s:5:\"label\";s:19:\"Serbian Dinar (RSD)\";s:6:\"symbol\";s:6:\"дин\";s:13:\"exchange_rate\";s:8:\"100.1100\";s:7:\"country\";s:6:\"Serbia\";}i:45;a:5:{s:5:\"value\";s:3:\"BRL\";s:5:\"label\";s:20:\"Brazilian Real (BRL)\";s:6:\"symbol\";s:2:\"R$\";s:13:\"exchange_rate\";s:6:\"5.3400\";s:7:\"country\";s:6:\"Brazil\";}i:46;a:5:{s:5:\"value\";s:3:\"MXN\";s:5:\"label\";s:18:\"Mexican Peso (MXN)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:7:\"18.3700\";s:7:\"country\";s:6:\"Mexico\";}i:47;a:5:{s:5:\"value\";s:3:\"ARS\";s:5:\"label\";s:20:\"Argentine Peso (ARS)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:9:\"1429.7500\";s:7:\"country\";s:9:\"Argentina\";}i:48;a:5:{s:5:\"value\";s:3:\"CLP\";s:5:\"label\";s:18:\"Chilean Peso (CLP)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:8:\"963.9800\";s:7:\"country\";s:5:\"Chile\";}i:49;a:5:{s:5:\"value\";s:3:\"COP\";s:5:\"label\";s:20:\"Colombian Peso (COP)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:9:\"3867.9200\";s:7:\"country\";s:8:\"Colombia\";}i:50;a:5:{s:5:\"value\";s:3:\"PEN\";s:5:\"label\";s:18:\"Peruvian Sol (PEN)\";s:6:\"symbol\";s:2:\"S/\";s:13:\"exchange_rate\";s:6:\"3.4600\";s:7:\"country\";s:4:\"Peru\";}i:51;a:5:{s:5:\"value\";s:3:\"UYU\";s:5:\"label\";s:20:\"Uruguayan Peso (UYU)\";s:6:\"symbol\";s:2:\"$U\";s:13:\"exchange_rate\";s:7:\"39.9200\";s:7:\"country\";s:7:\"Uruguay\";}i:52;a:5:{s:5:\"value\";s:3:\"BOB\";s:5:\"label\";s:24:\"Bolivian Boliviano (BOB)\";s:6:\"symbol\";s:2:\"Bs\";s:13:\"exchange_rate\";s:6:\"6.9200\";s:7:\"country\";s:7:\"Bolivia\";}i:53;a:5:{s:5:\"value\";s:3:\"VES\";s:5:\"label\";s:25:\"Venezuelan Bolívar (VES)\";s:6:\"symbol\";s:4:\"Bs.S\";s:13:\"exchange_rate\";s:8:\"187.2900\";s:7:\"country\";s:9:\"Venezuela\";}i:54;a:5:{s:5:\"value\";s:3:\"RUB\";s:5:\"label\";s:19:\"Russian Ruble (RUB)\";s:6:\"symbol\";s:3:\"₽\";s:13:\"exchange_rate\";s:7:\"82.8900\";s:7:\"country\";s:6:\"Russia\";}i:55;a:5:{s:5:\"value\";s:3:\"TRY\";s:5:\"label\";s:18:\"Turkish Lira (TRY)\";s:6:\"symbol\";s:3:\"₺\";s:13:\"exchange_rate\";s:7:\"41.7000\";s:7:\"country\";s:6:\"Turkey\";}i:56;a:5:{s:5:\"value\";s:3:\"ILS\";s:5:\"label\";s:20:\"Israeli Shekel (ILS)\";s:6:\"symbol\";s:3:\"₪\";s:13:\"exchange_rate\";s:6:\"3.2800\";s:7:\"country\";s:6:\"Israel\";}i:57;a:5:{s:5:\"value\";s:3:\"UAH\";s:5:\"label\";s:23:\"Ukrainian Hryvnia (UAH)\";s:6:\"symbol\";s:3:\"₴\";s:13:\"exchange_rate\";s:7:\"41.3300\";s:7:\"country\";s:7:\"Ukraine\";}i:58;a:5:{s:5:\"value\";s:3:\"BYN\";s:5:\"label\";s:22:\"Belarusian Ruble (BYN)\";s:6:\"symbol\";s:2:\"Br\";s:13:\"exchange_rate\";s:6:\"3.2300\";s:7:\"country\";s:7:\"Belarus\";}i:59;a:5:{s:5:\"value\";s:3:\"KZT\";s:5:\"label\";s:23:\"Kazakhstani Tenge (KZT)\";s:6:\"symbol\";s:3:\"₸\";s:13:\"exchange_rate\";s:8:\"544.2300\";s:7:\"country\";s:10:\"Kazakhstan\";}i:60;a:5:{s:5:\"value\";s:3:\"UZS\";s:5:\"label\";s:21:\"Uzbekistani Som (UZS)\";s:6:\"symbol\";s:4:\"лв\";s:13:\"exchange_rate\";s:10:\"12078.6900\";s:7:\"country\";s:10:\"Uzbekistan\";}i:61;a:5:{s:5:\"value\";s:3:\"KGS\";s:5:\"label\";s:21:\"Kyrgyzstani Som (KGS)\";s:6:\"symbol\";s:4:\"лв\";s:13:\"exchange_rate\";s:7:\"87.3500\";s:7:\"country\";s:10:\"Kyrgyzstan\";}i:62;a:5:{s:5:\"value\";s:3:\"TJS\";s:5:\"label\";s:24:\"Tajikistani Somoni (TJS)\";s:6:\"symbol\";s:2:\"SM\";s:13:\"exchange_rate\";s:6:\"9.3800\";s:7:\"country\";s:10:\"Tajikistan\";}i:63;a:5:{s:5:\"value\";s:3:\"TMT\";s:5:\"label\";s:25:\"Turkmenistani Manat (TMT)\";s:6:\"symbol\";s:1:\"T\";s:13:\"exchange_rate\";s:6:\"3.5000\";s:7:\"country\";s:12:\"Turkmenistan\";}i:64;a:5:{s:5:\"value\";s:3:\"AFN\";s:5:\"label\";s:20:\"Afghan Afghani (AFN)\";s:6:\"symbol\";s:2:\"؋\";s:13:\"exchange_rate\";s:7:\"67.1500\";s:7:\"country\";s:11:\"Afghanistan\";}i:65;a:5:{s:5:\"value\";s:3:\"IRR\";s:5:\"label\";s:18:\"Iranian Rial (IRR)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:10:\"42434.4900\";s:7:\"country\";s:4:\"Iran\";}i:66;a:5:{s:5:\"value\";s:3:\"IQD\";s:5:\"label\";s:17:\"Iraqi Dinar (IQD)\";s:6:\"symbol\";s:5:\"ع.د\";s:13:\"exchange_rate\";s:9:\"1309.3300\";s:7:\"country\";s:4:\"Iraq\";}i:67;a:5:{s:5:\"value\";s:3:\"SYP\";s:5:\"label\";s:18:\"Syrian Pound (SYP)\";s:6:\"symbol\";s:2:\"£\";s:13:\"exchange_rate\";s:10:\"12890.1200\";s:7:\"country\";s:5:\"Syria\";}i:68;a:5:{s:5:\"value\";s:3:\"YER\";s:5:\"label\";s:17:\"Yemeni Rial (YER)\";s:6:\"symbol\";s:3:\"﷼\";s:13:\"exchange_rate\";s:8:\"239.0000\";s:7:\"country\";s:5:\"Yemen\";}i:69;a:5:{s:5:\"value\";s:3:\"SOS\";s:5:\"label\";s:21:\"Somali Shilling (SOS)\";s:6:\"symbol\";s:1:\"S\";s:13:\"exchange_rate\";s:8:\"571.3000\";s:7:\"country\";s:7:\"Somalia\";}i:70;a:5:{s:5:\"value\";s:3:\"ETB\";s:5:\"label\";s:20:\"Ethiopian Birr (ETB)\";s:6:\"symbol\";s:2:\"Br\";s:13:\"exchange_rate\";s:8:\"143.9200\";s:7:\"country\";s:8:\"Ethiopia\";}i:71;a:5:{s:5:\"value\";s:3:\"TZS\";s:5:\"label\";s:24:\"Tanzanian Shilling (TZS)\";s:6:\"symbol\";s:3:\"TSh\";s:13:\"exchange_rate\";s:9:\"2445.6500\";s:7:\"country\";s:8:\"Tanzania\";}i:72;a:5:{s:5:\"value\";s:3:\"UGX\";s:5:\"label\";s:22:\"Ugandan Shilling (UGX)\";s:6:\"symbol\";s:3:\"USh\";s:13:\"exchange_rate\";s:9:\"3430.1500\";s:7:\"country\";s:6:\"Uganda\";}i:73;a:5:{s:5:\"value\";s:3:\"RWF\";s:5:\"label\";s:19:\"Rwandan Franc (RWF)\";s:6:\"symbol\";s:2:\"RF\";s:13:\"exchange_rate\";s:9:\"1452.9700\";s:7:\"country\";s:6:\"Rwanda\";}i:74;a:5:{s:5:\"value\";s:3:\"BIF\";s:5:\"label\";s:21:\"Burundian Franc (BIF)\";s:6:\"symbol\";s:3:\"FBu\";s:13:\"exchange_rate\";s:9:\"2959.3900\";s:7:\"country\";s:7:\"Burundi\";}i:75;a:5:{s:5:\"value\";s:3:\"MWK\";s:5:\"label\";s:21:\"Malawian Kwacha (MWK)\";s:6:\"symbol\";s:2:\"MK\";s:13:\"exchange_rate\";s:9:\"1743.1500\";s:7:\"country\";s:6:\"Malawi\";}i:76;a:5:{s:5:\"value\";s:3:\"ZMW\";s:5:\"label\";s:20:\"Zambian Kwacha (ZMW)\";s:6:\"symbol\";s:2:\"ZK\";s:13:\"exchange_rate\";s:7:\"23.8200\";s:7:\"country\";s:6:\"Zambia\";}i:77;a:5:{s:5:\"value\";s:3:\"BWP\";s:5:\"label\";s:19:\"Botswana Pula (BWP)\";s:6:\"symbol\";s:1:\"P\";s:13:\"exchange_rate\";s:7:\"14.1500\";s:7:\"country\";s:8:\"Botswana\";}i:78;a:5:{s:5:\"value\";s:3:\"NAD\";s:5:\"label\";s:21:\"Namibian Dollar (NAD)\";s:6:\"symbol\";s:2:\"N$\";s:13:\"exchange_rate\";s:7:\"17.2000\";s:7:\"country\";s:7:\"Namibia\";}i:79;a:5:{s:5:\"value\";s:3:\"SZL\";s:5:\"label\";s:21:\"Swazi Lilangeni (SZL)\";s:6:\"symbol\";s:1:\"L\";s:13:\"exchange_rate\";s:7:\"17.2000\";s:7:\"country\";s:8:\"Eswatini\";}i:80;a:5:{s:5:\"value\";s:3:\"LSL\";s:5:\"label\";s:18:\"Lesotho Loti (LSL)\";s:6:\"symbol\";s:1:\"L\";s:13:\"exchange_rate\";s:7:\"17.2000\";s:7:\"country\";s:7:\"Lesotho\";}i:81;a:5:{s:5:\"value\";s:3:\"MUR\";s:5:\"label\";s:21:\"Mauritian Rupee (MUR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:7:\"45.3600\";s:7:\"country\";s:9:\"Mauritius\";}i:82;a:5:{s:5:\"value\";s:3:\"SCR\";s:5:\"label\";s:23:\"Seychellois Rupee (SCR)\";s:6:\"symbol\";s:3:\"₨\";s:13:\"exchange_rate\";s:7:\"14.6500\";s:7:\"country\";s:10:\"Seychelles\";}i:83;a:5:{s:5:\"value\";s:3:\"MAD\";s:5:\"label\";s:21:\"Moroccan Dirham (MAD)\";s:6:\"symbol\";s:6:\"د.م.\";s:13:\"exchange_rate\";s:6:\"9.1200\";s:7:\"country\";s:7:\"Morocco\";}i:84;a:5:{s:5:\"value\";s:3:\"TND\";s:5:\"label\";s:20:\"Tunisian Dinar (TND)\";s:6:\"symbol\";s:5:\"د.ت\";s:13:\"exchange_rate\";s:6:\"2.9100\";s:7:\"country\";s:7:\"Tunisia\";}i:85;a:5:{s:5:\"value\";s:3:\"DZD\";s:5:\"label\";s:20:\"Algerian Dinar (DZD)\";s:6:\"symbol\";s:5:\"د.ج\";s:13:\"exchange_rate\";s:8:\"129.2400\";s:7:\"country\";s:7:\"Algeria\";}i:86;a:5:{s:5:\"value\";s:3:\"LYD\";s:5:\"label\";s:18:\"Libyan Dinar (LYD)\";s:6:\"symbol\";s:5:\"ل.د\";s:13:\"exchange_rate\";s:6:\"5.3900\";s:7:\"country\";s:5:\"Libya\";}i:87;a:5:{s:5:\"value\";s:3:\"SDG\";s:5:\"label\";s:20:\"Sudanese Pound (SDG)\";s:6:\"symbol\";s:6:\"ج.س.\";s:13:\"exchange_rate\";s:8:\"454.3000\";s:7:\"country\";s:5:\"Sudan\";}i:88;a:5:{s:5:\"value\";s:3:\"SSP\";s:5:\"label\";s:26:\"South Sudanese Pound (SSP)\";s:6:\"symbol\";s:2:\"£\";s:13:\"exchange_rate\";s:9:\"4722.1700\";s:7:\"country\";s:11:\"South Sudan\";}i:89;a:5:{s:5:\"value\";s:3:\"CDF\";s:5:\"label\";s:21:\"Congolese Franc (CDF)\";s:6:\"symbol\";s:2:\"FC\";s:13:\"exchange_rate\";s:9:\"2580.5500\";s:7:\"country\";s:28:\"Democratic Republic of Congo\";}i:90;a:5:{s:5:\"value\";s:3:\"XAF\";s:5:\"label\";s:31:\"Central African CFA Franc (XAF)\";s:6:\"symbol\";s:4:\"FCFA\";s:13:\"exchange_rate\";s:8:\"560.2800\";s:7:\"country\";s:24:\"Central African Republic\";}i:91;a:5:{s:5:\"value\";s:3:\"XOF\";s:5:\"label\";s:28:\"West African CFA Franc (XOF)\";s:6:\"symbol\";s:3:\"CFA\";s:13:\"exchange_rate\";s:8:\"560.2800\";s:7:\"country\";s:7:\"Senegal\";}i:92;a:5:{s:5:\"value\";s:3:\"GMD\";s:5:\"label\";s:20:\"Gambian Dalasi (GMD)\";s:6:\"symbol\";s:1:\"D\";s:13:\"exchange_rate\";s:7:\"73.4100\";s:7:\"country\";s:6:\"Gambia\";}i:93;a:5:{s:5:\"value\";s:3:\"GNF\";s:5:\"label\";s:19:\"Guinean Franc (GNF)\";s:6:\"symbol\";s:2:\"FG\";s:13:\"exchange_rate\";s:9:\"8692.7600\";s:7:\"country\";s:6:\"Guinea\";}i:94;a:5:{s:5:\"value\";s:3:\"SLL\";s:5:\"label\";s:26:\"Sierra Leonean Leone (SLL)\";s:6:\"symbol\";s:2:\"Le\";s:13:\"exchange_rate\";s:10:\"23337.0400\";s:7:\"country\";s:12:\"Sierra Leone\";}i:95;a:5:{s:5:\"value\";s:3:\"LRD\";s:5:\"label\";s:21:\"Liberian Dollar (LRD)\";s:6:\"symbol\";s:2:\"L$\";s:13:\"exchange_rate\";s:8:\"181.5600\";s:7:\"country\";s:7:\"Liberia\";}i:96;a:5:{s:5:\"value\";s:3:\"CVE\";s:5:\"label\";s:25:\"Cape Verdean Escudo (CVE)\";s:6:\"symbol\";s:1:\"$\";s:13:\"exchange_rate\";s:7:\"94.1800\";s:7:\"country\";s:10:\"Cape Verde\";}i:97;a:5:{s:5:\"value\";s:3:\"STN\";s:5:\"label\";s:36:\"São Tomé and Príncipe Dobra (STN)\";s:6:\"symbol\";s:2:\"Db\";s:13:\"exchange_rate\";s:7:\"20.9300\";s:7:\"country\";s:24:\"São Tomé and Príncipe\";}i:98;a:5:{s:5:\"value\";s:3:\"AOA\";s:5:\"label\";s:20:\"Angolan Kwanza (AOA)\";s:6:\"symbol\";s:2:\"Kz\";s:13:\"exchange_rate\";s:8:\"920.1900\";s:7:\"country\";s:6:\"Angola\";}i:99;a:5:{s:5:\"value\";s:3:\"ZWL\";s:5:\"label\";s:23:\"Zimbabwean Dollar (ZWL)\";s:6:\"symbol\";s:2:\"Z$\";s:13:\"exchange_rate\";s:7:\"26.6500\";s:7:\"country\";s:8:\"Zimbabwe\";}}', 1760119915);

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
(1, '100000000000000', 'Assets', 'Assets', NULL, 1, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(2, '100010000000000', 'Current Assets', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(3, '100020000000000', 'Fixed Assets', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(4, '100030000000000', 'Intangible Assets', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(5, '100040000000000', 'Investments', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(6, '100050000000000', 'Other Assets', 'Assets', 1, 2, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(7, '100010000000001', 'Cash in Hand', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(8, '100010000000002', 'Petty Cash', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(9, '100010000000003', 'Bank Accounts', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(10, '100010000000004', 'Accounts Receivable', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(11, '100010000000005', 'Inventory', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(12, '100010000000006', 'Prepaid Expenses', 'Assets', 2, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(13, '100020000000001', 'Land', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(14, '100020000000002', 'Buildings', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(15, '100020000000003', 'Machinery', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(16, '100020000000004', 'Furniture and Fixtures', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(17, '100020000000005', 'Vehicles', 'Assets', 3, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(18, '100030000000001', 'Goodwill', 'Assets', 4, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(19, '100030000000002', 'Software Licenses', 'Assets', 4, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(20, '100030000000003', 'Patents and Trademarks', 'Assets', 4, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(21, '100040000000001', 'Long-term Investments', 'Assets', 5, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(22, '100040000000002', 'Short-term Investments', 'Assets', 5, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(23, '100050000000001', 'Deferred Tax Asset', 'Assets', 6, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(24, '100050000000002', 'Security Deposits', 'Assets', 6, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(25, '100050000000003', 'Employee Advances', 'Assets', 6, 3, 'USD', 'Active', '2025-10-06 16:51:03', NULL, NULL, 1, 1),
(26, '200000000000000', 'Liabilities', 'Liabilities', NULL, 1, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(27, '200010000000000', 'Current Liabilities', 'Liabilities', 26, 2, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(28, '200020000000000', 'Long-term Liabilities', 'Liabilities', 26, 2, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(29, '200030000000000', 'Provisions', 'Liabilities', 26, 2, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(30, '200040000000000', 'Deferred Liabilities', 'Liabilities', 26, 2, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(31, '200010000000001', 'Accounts Payable', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(32, '200010000000002', 'Accrued Expenses', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(33, '200010000000003', 'Short-term Loans', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(34, '200010000000004', 'Taxes Payable', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(35, '200010000000005', 'Wages Payable', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(36, '200010000000006', 'Interest Payable', 'Liabilities', 27, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(37, '200020000000001', 'Bank Loans', 'Liabilities', 28, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(38, '200020000000002', 'Lease Obligations', 'Liabilities', 28, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(39, '200020000000003', 'Bonds Payable', 'Liabilities', 28, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(40, '200020000000004', 'Mortgage Payable', 'Liabilities', 28, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(41, '200030000000001', 'Provision for Income Tax', 'Liabilities', 29, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(42, '200030000000002', 'Provision for Bonus', 'Liabilities', 29, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(43, '200030000000003', 'Provision for Gratuity', 'Liabilities', 29, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(44, '200040000000001', 'Deferred Tax Liability', 'Liabilities', 30, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(45, '200040000000002', 'Deferred Revenue', 'Liabilities', 30, 3, 'USD', 'Active', '2025-10-06 16:51:24', NULL, NULL, 1, 1),
(62, '300000000000000', 'Equity', 'Equity', NULL, 1, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(63, '300010000000000', 'Share Capital', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(64, '300020000000000', 'Reserves and Surplus', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(65, '300030000000000', 'Retained Earnings', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(66, '300040000000000', 'Owner’s / Partner’s Capital', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(67, '300050000000000', 'Drawings / Withdrawals', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(68, '300060000000000', 'Other Comprehensive Income (OCI)', 'Equity', 62, 2, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(69, '300010000000001', 'Authorized Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(70, '300010000000002', 'Issued Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(71, '300010000000003', 'Subscribed Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(72, '300010000000004', 'Paid-up Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(73, '300010000000005', 'Preference Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(74, '300010000000006', 'Ordinary Share Capital', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(75, '300010000000007', 'Treasury Shares', 'Equity', 63, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(76, '300020000000001', 'General Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(77, '300020000000002', 'Capital Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(78, '300020000000003', 'Revaluation Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(79, '300020000000004', 'Share Premium Account', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(80, '300020000000005', 'Statutory Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(81, '300020000000006', 'Investment Fluctuation Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(82, '300020000000007', 'Foreign Currency Translation Reserve', 'Equity', 64, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(83, '300030000000001', 'Opening Retained Earnings', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(84, '300030000000002', 'Current Year Profit', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(85, '300030000000003', 'Prior Period Adjustments', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(86, '300030000000004', 'Transferred to Reserves', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(87, '300030000000005', 'Accumulated Profits', 'Equity', 65, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(88, '300040000000001', 'Owner’s Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(89, '300040000000002', 'Partner A Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(90, '300040000000003', 'Partner B Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(91, '300040000000004', 'Director Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(92, '300040000000005', 'Proprietor Capital Account', 'Equity', 66, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(93, '300050000000001', 'Owner Drawings', 'Equity', 67, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(94, '300050000000002', 'Partner Drawings', 'Equity', 67, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(95, '300050000000003', 'Director Drawings', 'Equity', 67, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(96, '300050000000004', 'Personal Expenses (Non-Business)', 'Equity', 67, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(97, '300060000000001', 'Unrealized Gain on Investments', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(98, '300060000000002', 'Unrealized Loss on Investments', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(99, '300060000000003', 'Fair Value Adjustment', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(100, '300060000000004', 'Actuarial Gains / Losses on Pensions', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(101, '300060000000005', 'Currency Translation Differences (OCI)', 'Equity', 68, 3, 'USD', 'Active', '2025-10-06 16:51:58', NULL, NULL, 1, 1),
(102, '400000000000000', 'Revenue', 'Revenue', NULL, 1, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(103, '400010000000000', 'Operating Revenue', 'Revenue', 102, 2, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(104, '400020000000000', 'Non-Operating Revenue', 'Revenue', 102, 2, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(105, '400030000000000', 'Other Income', 'Revenue', 102, 2, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(106, '400040000000000', 'Discounts & Rebates', 'Revenue', 102, 2, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(107, '400010000000001', 'Sales Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(108, '400010000000002', 'Service Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(109, '400010000000003', 'Product Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(110, '400010000000004', 'Rental Income', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(111, '400010000000005', 'Maintenance Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(112, '400010000000006', 'Subscription Revenue', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(113, '400010000000007', 'Commission Income', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(114, '400010000000008', 'Consultancy Income', 'Revenue', 103, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(115, '400020000000001', 'Interest Income', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(116, '400020000000002', 'Dividend Income', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(117, '400020000000003', 'Gain on Sale of Assets', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(118, '400020000000004', 'Foreign Exchange Gain', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(119, '400020000000005', 'Investment Income', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(120, '400020000000006', 'Royalty Income', 'Revenue', 104, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(121, '400030000000001', 'Miscellaneous Income', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(122, '400030000000002', 'Scrap Sales', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(123, '400030000000003', 'Insurance Claim Received', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(124, '400030000000004', 'Rebate Received', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(125, '400030000000005', 'Refunds & Adjustments', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(126, '400030000000006', 'Grant Income', 'Revenue', 105, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(127, '400040000000001', 'Sales Discounts', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(128, '400040000000002', 'Early Payment Discounts', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(129, '400040000000003', 'Customer Rebates', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(130, '400040000000004', 'Trade Discounts', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(131, '400040000000005', 'Loyalty Program Discounts', 'Revenue', 106, 3, 'USD', 'Active', '2025-10-06 16:52:21', NULL, NULL, 1, 1),
(132, '500000000000000', 'Expenses', 'Expenses', NULL, 1, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(133, '500010000000000', 'Cost of Goods Sold', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(134, '500020000000000', 'Administrative Expenses', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(135, '500030000000000', 'Selling & Distribution Expenses', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(136, '500040000000000', 'Financial Expenses', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(137, '500050000000000', 'Other Expenses', 'Expenses', 132, 2, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(138, '500010000000001', 'Raw Material Consumed', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(139, '500010000000002', 'Purchases', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(140, '500010000000003', 'Purchase Returns', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(141, '500010000000004', 'Freight Inward', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(142, '500010000000005', 'Packing Materials', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(143, '500010000000006', 'Factory Wages', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(144, '500010000000007', 'Factory Rent', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(145, '500010000000008', 'Depreciation - Factory Equipment', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(146, '500010000000009', 'Power and Fuel', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(147, '500010000000010', 'Direct Labor', 'Expenses', 133, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(148, '500020000000001', 'Office Salaries', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(149, '500020000000002', 'Office Rent', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(150, '500020000000003', 'Utilities', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(151, '500020000000004', 'Stationery & Office Supplies', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(152, '500020000000005', 'Printing & Postage', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(153, '500020000000006', 'IT & Internet Expenses', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(154, '500020000000007', 'Repairs & Maintenance', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(155, '500020000000008', 'Depreciation - Office Equipment', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(156, '500020000000009', 'Professional Fees', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(157, '500020000000010', 'Travel & Conveyance', 'Expenses', 134, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(158, '500030000000001', 'Advertising & Promotion', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(159, '500030000000002', 'Sales Commission', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(160, '500030000000003', 'Freight Outward', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(161, '500030000000004', 'Delivery & Transportation', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(162, '500030000000005', 'Sales Staff Salaries', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(163, '500030000000006', 'Showroom Expenses', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(164, '500030000000007', 'Discount Allowed', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(165, '500030000000008', 'Promotional Samples', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(166, '500030000000009', 'After-Sales Service', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(167, '500030000000010', 'Trade Show Expenses', 'Expenses', 135, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(168, '500040000000001', 'Bank Charges', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(169, '500040000000002', 'Interest Expense', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(170, '500040000000003', 'Loan Processing Fees', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(171, '500040000000004', 'Foreign Exchange Loss', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(172, '500040000000005', 'Credit Card Fees', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(173, '500040000000006', 'Bank Overdraft Interest', 'Expenses', 136, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(174, '500050000000001', 'Bad Debts', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(175, '500050000000002', 'Depreciation - Other Assets', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(176, '500050000000003', 'Amortization Expense', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(177, '500050000000004', 'Loss on Sale of Assets', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(178, '500050000000005', 'Donations & Contributions', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(179, '500050000000006', 'Penalties & Fines', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(180, '500050000000007', 'Staff Welfare', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(181, '500050000000008', 'Training & Seminars', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(182, '500050000000009', 'Miscellaneous Expenses', 'Expenses', 137, 3, 'USD', 'Active', '2025-10-06 16:52:35', NULL, NULL, 1, 1),
(183, '100010000000007', 'test', 'Assets', 2, 3, 'USD', 'Active', '2025-10-07 03:16:47', '2025-10-07 03:16:47', NULL, 1, 1);

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

INSERT INTO `companies` (`id`, `parent_comp`, `company_name`, `company_code`, `legal_name`, `trading_name`, `registration_number`, `tax_id`, `vat_number`, `incorporation_date`, `company_type`, `email`, `phone`, `fax`, `website`, `address_line_1`, `address_line_2`, `city`, `state_province`, `postal_code`, `country`, `timezone`, `industry`, `business_description`, `employee_count`, `annual_revenue`, `currency`, `fiscal_year_start`, `license_number`, `license_expiry`, `compliance_certifications`, `legal_notes`, `bank_name`, `bank_account_number`, `bank_routing_number`, `swift_code`, `iban`, `logo`, `brand_color_primary`, `brand_color_secondary`, `status`, `auto_voucher_numbering`, `accounting_vno_auto`, `base_currency`, `settings`, `features`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `package_id`, `license_start_date`, `license_end_date`) VALUES
(1, 'Yes', 'Acme Corporation', 'ACME001', NULL, NULL, 'REG001', NULL, NULL, NULL, 'private_limited', 'contact@acme.com', NULL, NULL, NULL, '123 Main Street', NULL, 'New York', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'PKR', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-10-06 21:56:28', NULL, 3, '2025-10-01', '2026-10-01'),
(2, 'No', 'Tech Solutions Inc', 'TECH001', NULL, NULL, 'REG002', NULL, NULL, NULL, 'private_limited', 'info@techsolutions.com', NULL, NULL, NULL, '456 Tech Avenue', NULL, 'San Francisco', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(3, 'No', 'Global Industries Ltd', 'GLOBAL001', NULL, NULL, 'REG003', NULL, NULL, NULL, 'private_limited', 'contact@globalindustries.com', NULL, NULL, NULL, '789 Business District', NULL, 'London', NULL, NULL, 'United Kingdom', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(4, 'No', 'Innovation Hub', 'INNOV001', NULL, NULL, 'REG004', NULL, NULL, NULL, 'private_limited', 'hello@innovationhub.com', NULL, NULL, NULL, '321 Innovation Street', NULL, 'Boston', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 1, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL),
(5, 'No', 'Enterprise Systems', 'ENT001', NULL, NULL, 'REG005', NULL, NULL, NULL, 'private_limited', 'contact@enterprisesystems.com', NULL, NULL, NULL, '654 Corporate Plaza', NULL, 'Chicago', NULL, NULL, 'United States', 'UTC', NULL, NULL, NULL, NULL, 'USD', '01-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '#3B82F6', '#64748B', 0, 1, 1, 'USD', NULL, NULL, NULL, NULL, '2025-09-14 05:39:19', '2025-09-14 05:39:19', NULL, NULL, NULL, NULL);

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
  `source` varchar(255) NOT NULL DEFAULT 'manual',
  `api_provider` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `effective_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currency_exchange_rate_history`
--

INSERT INTO `currency_exchange_rate_history` (`id`, `currency_id`, `exchange_rate`, `previous_rate`, `rate_change`, `source`, `api_provider`, `notes`, `effective_date`, `created_at`, `updated_at`) VALUES
(1, 7, 1.515500, 1.515500, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(2, 43, 1.674800, 1.674800, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(3, 46, 5.342300, 5.342300, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(4, 6, 1.396100, 1.396100, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(5, 5, 0.797570, 0.797600, -0.003761, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(6, 9, 7.119500, 7.119500, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(7, 40, 20.815000, 20.815000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(8, 38, 6.393800, 6.393800, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(9, 2, 0.856310, 0.856300, 0.001168, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(10, 3, 0.744560, 0.744600, -0.005372, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(11, 10, 7.783500, 7.783500, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(12, 41, 333.220000, 333.220000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(13, 20, 16615.000000, 16615.000000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(14, 59, 3.279200, 3.279200, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(15, 13, 88.780000, 88.780000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(16, 4, 150.040000, 150.040000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(17, 12, 1412.230000, 1412.230000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(18, 47, 18.416700, 18.416700, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(19, 19, 4.215000, 4.215000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(20, 37, 9.951200, 9.951200, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(21, 8, 1.717800, 1.717800, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(22, 21, 58.328000, 58.328000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(23, 39, 3.641700, 3.641700, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(24, 42, 4.357300, 4.357300, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(25, 36, 9.409100, 9.409100, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:10', '2025-10-07 02:31:10', '2025-10-07 02:31:10'),
(26, 11, 1.293400, 1.293400, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:11', '2025-10-07 02:31:11', '2025-10-07 02:31:11'),
(27, 18, 32.425000, 32.425000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:11', '2025-10-07 02:31:11', '2025-10-07 02:31:11'),
(28, 58, 41.693000, 41.693000, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:11', '2025-10-07 02:31:11', '2025-10-07 02:31:11'),
(29, 32, 17.248700, 17.248700, 0.000000, 'api', 'frankfurter', 'Automatically updated from frankfurter API', '2025-10-07 02:31:11', '2025-10-07 02:31:11', '2025-10-07 02:31:11'),
(30, 7, 1.515500, 1.515500, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(31, 43, 1.674800, 1.674800, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(32, 46, 5.342300, 5.342300, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(33, 6, 1.396100, 1.396100, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(34, 5, 0.797570, 0.797600, -0.003761, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(35, 9, 7.119500, 7.119500, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(36, 40, 20.815000, 20.815000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(37, 38, 6.393800, 6.393800, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(38, 2, 0.856310, 0.856300, 0.001168, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(39, 3, 0.744560, 0.744600, -0.005372, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(40, 10, 7.783500, 7.783500, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(41, 41, 333.220000, 333.220000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(42, 20, 16615.000000, 16615.000000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(43, 59, 3.279200, 3.279200, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(44, 13, 88.780000, 88.780000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(45, 4, 150.040000, 150.040000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(46, 12, 1412.230000, 1412.230000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(47, 47, 18.416700, 18.416700, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(48, 19, 4.215000, 4.215000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(49, 37, 9.951200, 9.951200, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(50, 8, 1.717800, 1.717800, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(51, 21, 58.328000, 58.328000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(52, 39, 3.641700, 3.641700, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(53, 42, 4.357300, 4.357300, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(54, 36, 9.409100, 9.409100, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(55, 11, 1.293400, 1.293400, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(56, 18, 32.425000, 32.425000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(57, 58, 41.693000, 41.693000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(58, 32, 17.248700, 17.248700, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:31:38', '2025-10-07 02:31:38', '2025-10-07 02:31:38'),
(59, 23, 3.670000, 3.670000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(60, 67, 67.150000, 80.000000, -16.062500, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(61, 101, 920.190000, 650.000000, 41.567692, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(62, 48, 1429.750000, 100.000000, 1329.750000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(63, 7, 1.510000, 1.515500, -0.362917, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(64, 15, 121.750000, 85.000000, 43.235294, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(65, 43, 1.670000, 1.674800, -0.286601, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(66, 27, 0.376000, 0.380000, -1.052632, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(67, 77, 2959.390000, 2000.000000, 47.969500, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(68, 53, 6.920000, 6.900000, 0.289855, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(69, 46, 5.340000, 5.342300, -0.043053, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(70, 80, 14.150000, 11.000000, 28.636364, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(71, 61, 3.230000, 2.500000, 29.200000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(72, 6, 1.400000, 1.396100, 0.279350, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(73, 92, 2580.550000, 2000.000000, 29.027500, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(74, 5, 0.796000, 0.797600, -0.200602, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(75, 49, 963.980000, 800.000000, 20.497500, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(76, 9, 7.130000, 7.119500, 0.147482, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(77, 50, 3867.920000, 3800.000000, 1.787368, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(78, 99, 94.180000, 100.000000, -5.820000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(79, 40, 20.780000, 20.815000, -0.168148, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(80, 38, 6.370000, 6.393800, -0.372236, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(81, 88, 129.240000, 135.000000, -4.266667, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(82, 31, 47.610000, 15.700000, 203.248408, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(83, 73, 143.920000, 45.000000, 219.822222, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(84, 2, 0.854000, 0.856300, -0.268597, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(85, 3, 0.742000, 0.744600, -0.349181, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(86, 35, 12.610000, 6.000000, 110.166667, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(87, 95, 73.410000, 52.000000, 41.173077, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(88, 96, 8692.760000, 10200.000000, -14.776863, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(89, 10, 7.780000, 7.783500, -0.044967, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(90, 44, 6.440000, 6.400000, 0.625000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(91, 41, 332.010000, 333.220000, -0.363123, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(92, 20, 16600.590000, 16615.000000, -0.086729, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(93, 59, 3.280000, 3.279200, 0.024396, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(94, 13, 88.780000, 88.780000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(95, 69, 1309.330000, 1460.000000, -10.319863, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(96, 68, 42434.490000, 42000.000000, 1.034500, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(97, 29, 0.709000, 0.710000, -0.140845, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(98, 4, 150.020000, 150.040000, -0.013330, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(99, 34, 129.110000, 110.000000, 17.372727, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(100, 64, 87.350000, 84.000000, 3.988095, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(101, 12, 1410.720000, 1412.230000, -0.106923, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(102, 26, 0.306000, 0.300000, 2.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(103, 62, 544.230000, 425.000000, 28.054118, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(104, 30, 89500.000000, 1500.000000, 5866.666667, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(105, 16, 302.320000, 200.000000, 51.160000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(106, 98, 181.560000, 160.000000, 13.475000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(107, 83, 17.200000, 14.500000, 18.620690, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(108, 89, 5.390000, 4.500000, 19.777778, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(109, 86, 9.120000, 9.000000, 1.333333, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(110, 84, 45.360000, 40.000000, 13.400000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(111, 78, 1743.150000, 800.000000, 117.893750, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(112, 47, 18.370000, 18.416700, -0.253574, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(113, 19, 4.210000, 4.215000, -0.118624, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(114, 81, 17.200000, 14.500000, 18.620690, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(115, 33, 1463.550000, 410.000000, 256.963415, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(116, 37, 9.930000, 9.951200, -0.213040, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(117, 17, 142.050000, 118.000000, 20.381356, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(118, 8, 1.710000, 1.717800, -0.454069, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(119, 28, 0.384000, 0.380000, 1.052632, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(120, 51, 3.460000, 3.700000, -6.486486, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(121, 21, 58.280000, 58.328000, -0.082293, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(122, 14, 283.250000, 160.000000, 77.031250, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(123, 39, 3.630000, 3.641700, -0.321279, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(124, 25, 3.640000, 3.640000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(125, 42, 4.350000, 4.357300, -0.167535, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(126, 45, 100.110000, 100.000000, 0.110000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(127, 57, 82.890000, 75.000000, 10.520000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(128, 76, 1452.970000, 1000.000000, 45.297000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(129, 24, 3.750000, 3.750000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(130, 85, 14.650000, 13.500000, 8.518519, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(131, 90, 454.300000, 55.000000, 726.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(132, 36, 9.380000, 9.409100, -0.309275, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(133, 11, 1.290000, 1.293400, -0.262873, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(134, 97, 23337.040000, 10200.000000, 128.794510, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(135, 72, 571.300000, 580.000000, -1.500000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(136, 91, 4722.170000, 300.000000, 1474.056667, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(137, 100, 20.930000, 22.000000, -4.863636, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(138, 70, 12890.120000, 2500.000000, 415.604800, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(139, 82, 17.200000, 14.500000, 18.620690, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(140, 18, 32.420000, 32.425000, -0.015420, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(141, 65, 9.380000, 11.000000, -14.727273, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(142, 66, 3.500000, 3.500000, 0.000000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(143, 87, 2.910000, 2.800000, 3.928571, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(144, 58, 41.700000, 41.693000, 0.016789, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(145, 74, 2445.650000, 2300.000000, 6.332609, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:05', '2025-10-07 02:33:05', '2025-10-07 02:33:05'),
(146, 60, 41.330000, 27.000000, 53.074074, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(147, 75, 3430.150000, 3500.000000, -1.995714, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(148, 52, 39.920000, 44.000000, -9.272727, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(149, 63, 12078.690000, 10700.000000, 12.884953, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(150, 56, 187.290000, 4000000.000000, -99.995318, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(151, 22, 26245.670000, 23000.000000, 14.111609, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(152, 93, 560.280000, 550.000000, 1.869091, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(153, 94, 560.280000, 550.000000, 1.869091, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(154, 71, 239.000000, 250.000000, -4.400000, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(155, 32, 17.200000, 17.248700, -0.282340, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(156, 79, 23.820000, 18.000000, 32.333333, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06'),
(157, 102, 26.650000, 4000000.000000, -99.999334, 'api', 'auto', 'Automatically updated from auto API', '2025-10-07 02:33:06', '2025-10-07 02:33:06', '2025-10-07 02:33:06');

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
(39, 2, 10, 'Currency Ledger', '/accounts/currency-ledger', 'file-text', 1, 1, '2025-10-07 02:15:23', '2025-10-07 02:15:23', NULL);

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
(51, '2025_10_07_024709_create_currency_exchange_rate_history_table', 26),
(52, '2025_10_07_070926_remove_unnecessary_fields_from_transaction_entries_table', 27),
(53, '2025_10_07_143456_make_description_nullable_in_transactions_table', 28),
(55, '2025_10_07_143648_optimize_description_field_in_transactions_table', 29),
(56, '0001_01_01_000002_create_jobs_table', 30),
(57, '2025_10_07_165813_add_attachments_to_transactions_table', 31),
(58, '2024_10_09_000001_create_logging_tables', 32);

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
(74, 3, 1, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(75, 3, 2, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(76, 3, 3, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(77, 3, 4, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(78, 3, 5, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(79, 3, 6, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(80, 3, 7, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(81, 3, 8, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(82, 3, 9, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(83, 3, 12, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(84, 3, 13, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(85, 3, 14, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(86, 3, 34, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(87, 3, 35, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(88, 3, 36, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(89, 3, 37, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48'),
(90, 3, 38, 1, '2025-10-09 08:51:48', '2025-10-09 08:51:48');

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
(4, 2, 'Account Management', 'account-management', 1, 2, '2025-10-06 07:13:09', '2025-10-06 07:13:09', NULL),
(10, 2, 'Reports', 'reports', 1, 3, '2025-10-07 02:05:16', '2025-10-07 02:05:16', NULL),
(11, 2, 'Accounting', 'accounting', 1, 1, '2025-10-07 02:07:30', '2025-10-07 02:07:30', NULL),
(12, 1, 'Log Reports', 'log-reports', 1, 2, '2025-10-09 08:47:01', '2025-10-09 08:47:01', NULL);

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
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `changed_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changed_fields`)),
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
(1, 1, 1, NULL, 'Test', 'test', NULL, 'CREATE', NULL, NULL, NULL, '127.0.0.1', NULL, NULL, 'Test log entry', '2025-10-09 08:31:41'),
(2, NULL, 1, 1, 'Accounts', 'transactions', 5, 'UPDATE', '{\"voucher_date\":\"2025-10-10\",\"reference_number\":\"REF1\",\"description\":null,\"total_debit\":\"283286.12\",\"total_credit\":\"283286.12\"}', '{\"voucher_number\":\"JV0002\",\"voucher_date\":\"2025-10-10\",\"voucher_type\":\"Journal\",\"reference_number\":\"REF1\",\"description\":null,\"status\":\"Draft\",\"total_debit\":283286.11898016994,\"total_credit\":283286.11898016994,\"currency_code\":\"PKR\",\"comp_id\":11,\"location_id\":1}', '{\"voucher_number\":{\"old\":null,\"new\":\"JV0002\"},\"voucher_type\":{\"old\":null,\"new\":\"Journal\"},\"status\":{\"old\":null,\"new\":\"Draft\"},\"total_debit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"total_credit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"currency_code\":{\"old\":null,\"new\":\"PKR\"},\"comp_id\":{\"old\":null,\"new\":11},\"location_id\":{\"old\":null,\"new\":1}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', 'zTMr7xpyrJZO9tuSaP3UCjCLqJZRrzo4acVTs8mB', 'Journal Voucher UPDATE: JV0002', '2025-10-10 08:01:25'),
(3, NULL, 1, 1, 'Accounts', 'transactions', 5, 'UPDATE', '{\"voucher_date\":\"2025-10-10\",\"reference_number\":\"REF1\",\"description\":null,\"total_debit\":\"283286.12\",\"total_credit\":\"283286.12\"}', '{\"voucher_number\":\"JV0002\",\"voucher_date\":\"2025-10-10\",\"voucher_type\":\"Journal\",\"reference_number\":\"REF1\",\"description\":null,\"status\":\"Draft\",\"total_debit\":283286.11898016994,\"total_credit\":283286.11898016994,\"currency_code\":\"PKR\",\"comp_id\":11,\"location_id\":1}', '{\"voucher_number\":{\"old\":null,\"new\":\"JV0002\"},\"voucher_type\":{\"old\":null,\"new\":\"Journal\"},\"status\":{\"old\":null,\"new\":\"Draft\"},\"total_debit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"total_credit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"currency_code\":{\"old\":null,\"new\":\"PKR\"},\"comp_id\":{\"old\":null,\"new\":11},\"location_id\":{\"old\":null,\"new\":1}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', 'zTMr7xpyrJZO9tuSaP3UCjCLqJZRrzo4acVTs8mB', 'Journal Voucher UPDATE: JV0002', '2025-10-10 08:29:44'),
(4, 1, 1, 1, 'Accounts', 'transactions', 5, 'UPDATE', '{\"voucher_date\":\"2025-10-10\",\"reference_number\":\"REF1\",\"description\":null,\"total_debit\":\"283286.12\",\"total_credit\":\"283286.12\"}', '{\"voucher_number\":\"JV0002\",\"voucher_date\":\"2025-10-10\",\"voucher_type\":\"Journal\",\"reference_number\":\"REF1\",\"description\":null,\"status\":\"Draft\",\"total_debit\":283286.11898016994,\"total_credit\":283286.11898016994,\"currency_code\":\"PKR\",\"comp_id\":11,\"location_id\":1}', '{\"voucher_number\":{\"old\":null,\"new\":\"JV0002\"},\"voucher_type\":{\"old\":null,\"new\":\"Journal\"},\"status\":{\"old\":null,\"new\":\"Draft\"},\"total_debit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"total_credit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"currency_code\":{\"old\":null,\"new\":\"PKR\"},\"comp_id\":{\"old\":null,\"new\":11},\"location_id\":{\"old\":null,\"new\":1}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', 'zTMr7xpyrJZO9tuSaP3UCjCLqJZRrzo4acVTs8mB', 'Journal Voucher UPDATE: JV0002', '2025-10-10 08:39:13'),
(5, 1, 1, 1, 'Accounts', 'transactions', 5, 'UPDATE', '{\"voucher_date\":\"2025-10-10\",\"reference_number\":\"REF1\",\"description\":null,\"total_debit\":\"283286.12\",\"total_credit\":\"283286.12\"}', '{\"voucher_number\":\"JV0002\",\"voucher_date\":\"2025-10-10\",\"voucher_type\":\"Journal\",\"reference_number\":\"REF1\",\"description\":null,\"status\":\"Draft\",\"total_debit\":283286.11898016994,\"total_credit\":283286.11898016994,\"currency_code\":\"PKR\",\"comp_id\":11,\"location_id\":1}', '{\"voucher_number\":{\"old\":null,\"new\":\"JV0002\"},\"voucher_type\":{\"old\":null,\"new\":\"Journal\"},\"status\":{\"old\":null,\"new\":\"Draft\"},\"total_debit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"total_credit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"currency_code\":{\"old\":null,\"new\":\"PKR\"},\"comp_id\":{\"old\":null,\"new\":11},\"location_id\":{\"old\":null,\"new\":1}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', 'zTMr7xpyrJZO9tuSaP3UCjCLqJZRrzo4acVTs8mB', 'Journal Voucher UPDATE: JV0002', '2025-10-10 11:24:02'),
(6, 1, 1, 1, 'Accounts', 'transactions', 5, 'DELETE', '{\"voucher_number\":\"JV0002\",\"voucher_date\":\"2025-10-10\",\"voucher_type\":\"Journal\",\"reference_number\":\"REF1\",\"description\":null,\"status\":\"Draft\",\"total_debit\":\"283286.12\",\"total_credit\":\"283286.12\",\"currency_code\":\"PKR\",\"comp_id\":11,\"location_id\":1,\"created_by\":1,\"created_at\":\"2025-10-10 12:55:04\"}', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', 'zTMr7xpyrJZO9tuSaP3UCjCLqJZRrzo4acVTs8mB', 'Journal Voucher DELETE: ', '2025-10-10 11:32:21'),
(7, 1, 1, 1, 'Accounts', 'transactions', 123, 'CREATE', NULL, '{\"voucher_number\":\"TEST001\",\"description\":\"Test voucher creation\"}', NULL, '127.0.0.1', 'Symfony', '7wWXWer65bk34jx9Y2FqUFMwGBFsaBDVwSBojXFv', 'Journal Voucher CREATE: TEST001', '2025-10-10 11:59:35'),
(8, 1, 1, 1, 'Accounts', 'transactions', 123, 'UPDATE', '{\"voucher_number\":\"TEST001\",\"description\":\"Test voucher creation\"}', '{\"voucher_number\":\"TEST001\",\"description\":\"Updated test voucher\"}', '{\"description\":{\"old\":\"Test voucher creation\",\"new\":\"Updated test voucher\"}}', '127.0.0.1', 'Symfony', '7wWXWer65bk34jx9Y2FqUFMwGBFsaBDVwSBojXFv', 'Journal Voucher UPDATE: TEST001', '2025-10-10 11:59:35'),
(9, 1, 1, 1, 'Accounts', 'transactions', 123, 'DELETE', '{\"voucher_number\":\"TEST001\",\"description\":\"Updated test voucher\"}', NULL, NULL, '127.0.0.1', 'Symfony', '7wWXWer65bk34jx9Y2FqUFMwGBFsaBDVwSBojXFv', 'Journal Voucher DELETE: ', '2025-10-10 11:59:35'),
(10, 1, 1, 1, 'Accounts', 'transactions', 6, 'CREATE', NULL, '{\"voucher_number\":\"JV0003\",\"voucher_date\":\"2025-10-10\",\"voucher_type\":\"Journal\",\"reference_number\":\"REF3\",\"description\":null,\"status\":\"Draft\",\"total_debit\":283286.11898016994,\"total_credit\":283286.11898016994,\"currency_code\":\"PKR\",\"comp_id\":1,\"location_id\":1,\"created_by\":1}', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', 'dmgZkGP7c5FlAi7A4uXexOcP3bC6NYUp0FOEm1s5', 'Journal Voucher CREATE: JV0003', '2025-10-10 12:13:29'),
(11, 1, 1, 1, 'Accounts', 'transactions', 6, 'UPDATE', '{\"voucher_date\":\"2025-10-10\",\"reference_number\":\"REF3\",\"description\":null,\"total_debit\":\"283286.12\",\"total_credit\":\"283286.12\"}', '{\"voucher_number\":\"JV0003\",\"voucher_date\":\"2025-10-10\",\"voucher_type\":\"Journal\",\"reference_number\":\"REF3\",\"description\":null,\"status\":\"Draft\",\"total_debit\":283286.11898016994,\"total_credit\":283286.11898016994,\"currency_code\":\"PKR\",\"comp_id\":1,\"location_id\":1}', '{\"voucher_number\":{\"old\":null,\"new\":\"JV0003\"},\"voucher_type\":{\"old\":null,\"new\":\"Journal\"},\"status\":{\"old\":null,\"new\":\"Draft\"},\"total_debit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"total_credit\":{\"old\":\"283286.12\",\"new\":283286.11898016994},\"currency_code\":{\"old\":null,\"new\":\"PKR\"},\"comp_id\":{\"old\":null,\"new\":1},\"location_id\":{\"old\":null,\"new\":1}}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 OPR/122.0.0.0', 'dmgZkGP7c5FlAi7A4uXexOcP3bC6NYUp0FOEm1s5', 'Journal Voucher UPDATE: JV0003', '2025-10-10 12:17:10');

-- --------------------------------------------------------

--
-- Table structure for table `tbl_change_history`
--

CREATE TABLE `tbl_change_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` bigint(20) UNSIGNED NOT NULL,
  `record_identifier` varchar(255) DEFAULT NULL,
  `field_name` varchar(100) NOT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `changed_by` bigint(20) UNSIGNED NOT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `change_reason` varchar(500) DEFAULT NULL,
  `change_ip` varchar(45) DEFAULT NULL,
  `change_type` enum('MANUAL','IMPORT','API','SYSTEM') DEFAULT 'MANUAL',
  `is_reversed` tinyint(1) DEFAULT 0,
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
  `record_identifier` varchar(255) DEFAULT NULL,
  `data_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data_snapshot`)),
  `related_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`related_data`)),
  `deleted_by` bigint(20) UNSIGNED NOT NULL,
  `deleted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delete_reason` varchar(500) DEFAULT NULL,
  `delete_ip` varchar(45) DEFAULT NULL,
  `recovery_expires_at` timestamp NULL DEFAULT NULL,
  `recovered_at` timestamp NULL DEFAULT NULL,
  `recovered_by` bigint(20) UNSIGNED DEFAULT NULL,
  `recovery_notes` text DEFAULT NULL,
  `status` enum('DELETED','RECOVERED','EXPIRED','PERMANENTLY_DELETED') DEFAULT 'DELETED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_report_logs`
--

CREATE TABLE `tbl_report_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `report_name` varchar(255) NOT NULL,
  `report_type` varchar(100) DEFAULT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
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
  `username` varchar(255) DEFAULT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_status` enum('SUCCESS','FAILED','BLOCKED','WARNING') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `location_info` varchar(255) DEFAULT NULL,
  `additional_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`additional_data`)),
  `risk_level` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'LOW',
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
(1, 'System', NULL, 'Administrator', 'admin@erpsystem.com', '+1234567890', 'admin', '12345', 1, 1, 1, NULL, '$2y$12$QZ/KZc6V/wK3YGJDrzVLaehK4R7EU.wRkOugBu/7kgg47SxX3yHPm', '08ad54dc2d0bc88dd2b664b5ea159358fea88597990596c1274c2ebea3cd49a0', '0QmJhz7v0T0pLTW7haG0ZfQf8X1AxvroLPH3n9atanjGUyMxzvF0DN2HOcXUgvuBJLFhMA9VKLdl47eykWYIAAqIroupU4oV5OKY', 'active', 'super_admin', '{\"users\":[\"create\",\"read\",\"update\",\"delete\"],\"financial\":[\"create\",\"read\",\"update\",\"delete\"],\"reports\":[\"create\",\"read\",\"update\",\"delete\"],\"settings\":[\"create\",\"read\",\"update\",\"delete\"],\"system\":[\"create\",\"read\",\"update\",\"delete\"]}', NULL, 'UTC', 'en', 'USD', 'system', '2025-10-10 12:12:00', '127.0.0.1', 0, NULL, 0, NULL, NULL, 'dmgZkGP7c5FlAi7A4uXexOcP3bC6NYUp0FOEm1s5', NULL, 0, '2025-08-14 10:19:49', '[{\"timestamp\":\"2025-10-10T17:12:00.049946Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-10T17:09:34.823941Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-10T17:04:13.102295Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-10T16:17:39.636942Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-10T11:05:17.421620Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-07T14:15:25.463551Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-07T08:15:01.696206Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-07T08:14:39.874589Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-07T06:11:28.210135Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-07T02:32:30.031424Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T16:10:22.267028Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T15:33:26.569522Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T15:19:19.876734Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T13:24:53.090881Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T13:24:15.741629Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T12:03:21.608905Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T11:38:59.768889Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T09:12:35.068673Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T09:11:40.860961Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true},{\"timestamp\":\"2025-10-06T09:09:57.731776Z\",\"ip\":\"127.0.0.1\",\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/138.0.0.0 Safari\\/537.36 OPR\\/122.0.0.0\",\"success\":true}]', NULL, NULL, '2025-08-14 10:19:49', '2025-10-10 12:12:00', NULL, NULL),
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
  `session_id` varchar(255) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `route_name` varchar(255) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `controller` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `response_status` int(11) DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL COMMENT 'in milliseconds',
  `memory_usage` int(11) DEFAULT NULL COMMENT 'in bytes',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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

INSERT INTO `transactions` (`id`, `voucher_number`, `voucher_date`, `voucher_type`, `voucher_sub_type`, `reference_number`, `description`, `status`, `total_debit`, `total_credit`, `currency_code`, `exchange_rate`, `base_currency_total`, `attachments`, `period_id`, `comp_id`, `location_id`, `created_by`, `approved_by`, `posted_by`, `approved_at`, `posted_at`, `rejection_reason`, `is_reversed`, `reversal_transaction_id`, `original_transaction_id`, `created_at`, `updated_at`) VALUES
(4, 'JV0001', '2025-10-07', 'Journal', NULL, 'REF1', NULL, 'Posted', 283286.12, 283286.12, 'PKR', 1.000000, 283286.12, '[\"1759856653_1759848077_1759847940_Doc1.docx\"]', 1, 1, 1, 1, NULL, NULL, NULL, '2025-10-10 06:44:37', NULL, 0, NULL, NULL, '2025-10-07 12:04:47', '2025-10-10 06:44:37'),
(6, 'JV0003', '2025-10-10', 'Journal', NULL, 'REF3', NULL, 'Draft', 283286.12, 283286.12, 'PKR', 1.000000, 283286.12, '[]', 1, 1, 1, 1, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, '2025-10-10 12:13:29', '2025-10-10 12:17:10');

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
  `reference` varchar(100) DEFAULT NULL,
  `comp_id` bigint(20) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transaction_entries`
--

INSERT INTO `transaction_entries` (`id`, `transaction_id`, `line_number`, `account_id`, `description`, `debit_amount`, `credit_amount`, `currency_code`, `exchange_rate`, `base_debit_amount`, `base_credit_amount`, `reference`, `comp_id`, `location_id`, `created_at`, `updated_at`) VALUES
(1, 4, 1, 7, NULL, 1000.00, 0.00, 'USD', 0.003530, 283286.12, 0.00, NULL, 1, 1, '2025-10-07 12:04:47', '2025-10-07 12:04:47'),
(2, 4, 2, 97, NULL, 0.00, 1000.00, 'USD', 0.003530, 0.00, 283286.12, NULL, 1, 1, '2025-10-07 12:04:47', '2025-10-07 12:04:47'),
(17, 6, 1, 7, NULL, 0.00, 1000.00, 'USD', 0.003530, 0.00, 283286.12, NULL, 1, 1, '2025-10-10 12:17:10', '2025-10-10 12:17:10'),
(18, 6, 2, 182, NULL, 1000.00, 0.00, 'USD', 0.003530, 283286.12, 0.00, NULL, 1, 1, '2025-10-10 12:17:10', '2025-10-10 12:17:10');

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
(81, 1, 1, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(82, 1, 2, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(83, 1, 3, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(84, 1, 4, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(85, 1, 5, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(86, 1, 6, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(87, 1, 7, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(88, 1, 8, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(89, 1, 9, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(90, 1, 10, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(91, 1, 11, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(92, 1, 12, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(93, 1, 13, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(94, 1, 14, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(95, 1, 34, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(96, 1, 35, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(97, 1, 36, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(98, 1, 37, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12'),
(99, 1, 38, 1, 1, 1, 1, '2025-10-09 08:52:12', '2025-10-09 08:52:12');

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
(1, 1, 1, 'Journal', 'JV', 4, 4, 'Monthly', '2025-10-07', 1, 1, '2025-10-06 07:18:44', '2025-10-10 12:13:29');

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
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_company` (`company_id`),
  ADD KEY `idx_table_record` (`table_name`,`record_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_action` (`action_type`),
  ADD KEY `idx_module` (`module_name`);

--
-- Indexes for table `tbl_change_history`
--
ALTER TABLE `tbl_change_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_record` (`table_name`,`record_id`),
  ADD KEY `idx_field` (`field_name`),
  ADD KEY `idx_changed_at` (`changed_at`),
  ADD KEY `idx_changed_by` (`changed_by`);

--
-- Indexes for table `tbl_deleted_data_recovery`
--
ALTER TABLE `tbl_deleted_data_recovery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_table_id` (`original_table`,`original_id`),
  ADD KEY `idx_identifier` (`record_identifier`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_expires` (`recovery_expires_at`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `tbl_report_logs`
--
ALTER TABLE `tbl_report_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_report` (`report_name`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `tbl_security_logs`
--
ALTER TABLE `tbl_security_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_event_status` (`event_status`),
  ADD KEY `idx_risk_level` (`risk_level`),
  ADD KEY `idx_created` (`created_at`);

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
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_session` (`session_id`),
  ADD KEY `idx_route` (`route_name`),
  ADD KEY `idx_created` (`created_at`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=184;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=158;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tbl_audit_logs`
--
ALTER TABLE `tbl_audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `transaction_entries`
--
ALTER TABLE `transaction_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_rights`
--
ALTER TABLE `user_rights`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `voucher_number_configurations`
--
ALTER TABLE `voucher_number_configurations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
