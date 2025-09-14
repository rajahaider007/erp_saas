<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== MANUALLY REMOVING FOREIGN KEY CONSTRAINTS ===\n";

$pdo = \DB::connection()->getPdo();

// List of possible foreign key constraint names to remove
$constraintsToRemove = [
    'package_features_package_id_foreign',
    'package_features_menu_id_foreign',
    'package_modules_package_id_foreign',
    'package_modules_module_id_foreign',
    'package_sections_package_id_foreign',
    'package_sections_section_id_foreign'
];

foreach ($constraintsToRemove as $constraint) {
    echo "Attempting to remove constraint: $constraint\n";
    
    // Try to find which table this constraint belongs to
    $stmt = $pdo->query("
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE CONSTRAINT_NAME = '$constraint' 
        AND TABLE_SCHEMA = DATABASE()
    ");
    
    $result = $stmt->fetch();
    if ($result) {
        $tableName = $result['TABLE_NAME'];
        echo "  Found in table: $tableName\n";
        
        try {
            $pdo->exec("ALTER TABLE `$tableName` DROP FOREIGN KEY `$constraint`");
            echo "  ✅ Successfully removed constraint: $constraint\n";
        } catch (Exception $e) {
            echo "  ❌ Failed to remove constraint: " . $e->getMessage() . "\n";
        }
    } else {
        echo "  ⚠️  Constraint not found in database\n";
    }
}

echo "\n=== FINAL CHECK ===\n";
$stmt = $pdo->query("
    SELECT 
        TABLE_NAME,
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME
    FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE 
        TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME LIKE 'package_%'
        AND REFERENCED_TABLE_NAME IS NOT NULL
");

$remainingConstraints = $stmt->fetchAll();
if (empty($remainingConstraints)) {
    echo "✅ No foreign key constraints remaining in package tables!\n";
} else {
    echo "⚠️  Remaining foreign key constraints:\n";
    foreach ($remainingConstraints as $constraint) {
        echo "  - {$constraint['TABLE_NAME']}.{$constraint['CONSTRAINT_NAME']}\n";
    }
}
