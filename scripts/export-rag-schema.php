<?php

use Illuminate\Contracts\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(ConsoleKernel::class)->bootstrap();

try {
    $connection = DB::connection();
    $databaseName = $connection->getDatabaseName();

    if (! $databaseName) {
        throw new RuntimeException('No database name is configured for the current connection.');
    }

    $tables = DB::select(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = \'BASE TABLE\' ORDER BY table_name',
        [$databaseName]
    );

    $statements = [];

    foreach ($tables as $tableRow) {
        $tableName = $tableRow->table_name ?? null;
        if (! $tableName) {
            continue;
        }

        $quotedTableName = str_replace('`', '``', $tableName);
        $createRow = DB::selectOne("SHOW CREATE TABLE `{$quotedTableName}`");
        if (! $createRow || ! isset($createRow->{'Create Table'})) {
            continue;
        }

        $statement = trim($createRow->{'Create Table'});
        if ($statement !== '') {
            $statements[] = $statement . ';';
        }
    }

    fwrite(STDOUT, implode("\n\n", $statements) . (empty($statements) ? '' : "\n"));
    exit(0);
} catch (Throwable $throwable) {
    fwrite(STDERR, 'RAG live schema export failed: ' . $throwable->getMessage() . PHP_EOL);
    exit(1);
}