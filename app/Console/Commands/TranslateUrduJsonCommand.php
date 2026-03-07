<?php

namespace App\Console\Commands;

use App\Services\GoogleTranslateService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class TranslateUrduJsonCommand extends Command
{
    protected $signature = 'translate:urdu-json
                            {--dry-run : Show what would be translated without writing files}
                            {--file= : Only translate this JSON file (e.g. accounts.json)}
                            {--delay=200 : Delay in ms between API calls to avoid rate limit}';

    protected $description = 'Translate all English strings in lang/ur/*.json to Urdu using Google Translate';

    public function handle(GoogleTranslateService $translator): int
    {
        $dryRun = $this->option('dry-run');
        $singleFile = $this->option('file');
        $delayMs = (int) $this->option('delay');

        $translator->setDelayMs(max(100, $delayMs));

        $urPath = lang_path('ur');
        if (! File::isDirectory($urPath)) {
            $this->error('lang/ur folder not found.');
            return Command::FAILURE;
        }

        $files = File::files($urPath);
        $jsonFiles = array_filter($files, fn ($f) => strtolower($f->getExtension()) === 'json');

        if ($singleFile) {
            $jsonFiles = array_filter($jsonFiles, fn ($f) => $f->getFilename() === $singleFile);
            if (empty($jsonFiles)) {
                $this->error("File not found: {$singleFile}");
                return Command::FAILURE;
            }
        }

        if (empty($jsonFiles)) {
            $this->warn('No JSON files found in lang/ur');
            return Command::SUCCESS;
        }

        $this->info('Translating English strings to Urdu (lang/ur)');
        if ($dryRun) {
            $this->warn('DRY RUN – no files will be modified.');
        }
        $this->newLine();

        $totalTranslated = 0;
        $totalSkipped = 0;

        foreach ($jsonFiles as $file) {
            $filename = $file->getFilename();
            $content = File::get($file->getPathname());
            $data = json_decode($content, true);

            if (! is_array($data)) {
                $this->warn("  [{$filename}] Invalid JSON – skip");
                continue;
            }

            [$translated, $skipped] = $this->translateArray($data, $translator, $dryRun, $filename, $delayMs);
            $totalTranslated += $translated;
            $totalSkipped += $skipped;

            if (! $dryRun && $translated > 0) {
                $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                File::put($file->getPathname(), $json . "\n");
            }
        }

        $this->newLine();
        $this->info("Done. Translated: {$totalTranslated}, Skipped (already Urdu): {$totalSkipped}");
        if ($dryRun && $totalTranslated > 0) {
            $this->info('Run without --dry-run to apply changes.');
        }

        return Command::SUCCESS;
    }

    /**
     * Recursively translate string values in array. Modifies $data in place.
     * Returns [translatedCount, skippedCount].
     */
    protected function translateArray(array &$data, GoogleTranslateService $translator, bool $dryRun, string $filename, int $delayMs = 200): array
    {
        $translated = 0;
        $skipped = 0;
        $bar = null;
        $toTranslate = $this->collectStrings($data);
        $total = count($toTranslate);

        if ($total === 0) {
            return [0, 0];
        }

        $this->line("  [{$filename}] {$total} string(s) to process...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($toTranslate as $path => $value) {
            if (! is_string($value) || trim($value) === '') {
                $bar->advance();
                continue;
            }
            if (! GoogleTranslateService::isEnglish($value)) {
                $skipped++;
                $bar->advance();
                continue;
            }
            if (! $dryRun) {
                $translatedValue = $translator->translate($value);
                $this->setByPath($data, $path, $translatedValue);
                usleep($delayMs * 1000);
            }
            $translated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        return [$translated, $skipped];
    }

    protected function collectStrings(array $data, string $prefix = ''): array
    {
        $out = [];
        foreach ($data as $key => $value) {
            $path = $prefix === '' ? $key : $prefix . '.' . $key;
            if (is_array($value)) {
                $out = array_merge($out, $this->collectStrings($value, $path));
            } elseif (is_string($value)) {
                $out[$path] = $value;
            }
        }
        return $out;
    }

    protected function setByPath(array &$data, string $path, string $newValue): void
    {
        $keys = explode('.', $path);
        $current = &$data;
        foreach ($keys as $i => $key) {
            if ($i === count($keys) - 1) {
                $current[$key] = $newValue;
                return;
            }
            if (! isset($current[$key]) || ! is_array($current[$key])) {
                return;
            }
            $current = &$current[$key];
        }
    }
}
