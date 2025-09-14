<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING FOREIGN KEY CONSTRAINTS ===\n";

$pdo = \DB::connection()->getPdo();

// Check package_features table
echo "\n--- package_features table ---\n";
$stmt = $pdo->query('SHOW CREATE TABLE package_features');
$result = $stmt->fetch();
echo $result[1] . "\n";

// Check package_modules table
echo "\n--- package_modules table ---\n";
$stmt = $pdo->query('SHOW CREATE TABLE package_modules');
$result = $stmt->fetch();
echo $result[1] . "\n";

// Check package_sections table
echo "\n--- package_sections table ---\n";
$stmt = $pdo->query('SHOW CREATE TABLE package_sections');
$result = $stmt->fetch();
echo $result[1] . "\n";
