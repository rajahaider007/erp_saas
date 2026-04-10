<?php

namespace App\Console\Commands;

use App\Services\RahjAi\KnowledgeBaseBuilder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class RahjaiBuildKnowledgeBase extends Command
{
    protected $signature = 'rahjai:build-knowledge
                            {--skip-npm : Do not run npm run rag:build}
                            {--with-artisan-overlay : Also write docs/rag/artisan_schema_overlay.jsonl (large DB schema dump)}';

    protected $description = 'Regenerate RAHJ AI RAG corpus (npm run rag:build). Optional PHP schema overlay.';

    public function handle(): int
    {
        if (! $this->option('skip-npm')) {
            $this->info('Running npm run rag:build → docs/rag/langchain_chunks.jsonl …');
            $cmd = PHP_OS_FAMILY === 'Windows' ? 'npm.cmd run rag:build' : 'npm run rag:build';
            $result = Process::path(base_path())->timeout(900)->run($cmd);

            if (! $result->successful()) {
                $this->error(trim($result->errorOutput() ?: $result->output()) ?: 'npm run rag:build failed.');

                return self::FAILURE;
            }

            $out = trim($result->output());
            if ($out !== '') {
                $this->line($out);
            }
            $this->info('RAG JSONL updated. Corpus cache invalidates automatically when the file mtime changes.');
        } else {
            $this->warn('Skipped npm (--skip-npm).');
        }

        if ($this->option('with-artisan-overlay')) {
            $this->warn('Writing artisan_schema_overlay.jsonl (can be large)…');
            $builder = app(KnowledgeBaseBuilder::class);
            $builder->buildCompleteKnowledgeBase();
            $this->info('Overlay written to docs/rag/artisan_schema_overlay.jsonl (merged at read time).');
        }

        $this->newLine();
        $this->info('Done. Test in the app: /rahj-ai');

        return self::SUCCESS;
    }
}
