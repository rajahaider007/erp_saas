<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING FOREIGN KEY CONSTRAINTS ===\n";

$pdo = \DB::connection()->getPdo();

// Check for foreign key constraints in package tables
$tables = ['package_features', 'package_modules', 'package_sections'];

foreach ($tables as $table) {
    echo "\n--- Foreign keys in $table ---\n";
    $stmt = $pdo->query("
        SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM 
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE 
            TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = '$table' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    $constraints = $stmt->fetchAll();
    if (empty($constraints)) {
        echo "No foreign key constraints found.\n";
    } else {
        foreach ($constraints as $constraint) {
            echo "Constraint: {$constraint['CONSTRAINT_NAME']}\n";
            echo "  Column: {$constraint['COLUMN_NAME']}\n";
            echo "  References: {$constraint['REFERENCED_TABLE_NAME']}.{$constraint['REFERENCED_COLUMN_NAME']}\n";
        }
    }
}
