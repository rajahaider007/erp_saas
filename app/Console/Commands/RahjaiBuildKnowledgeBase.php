<?php

namespace App\Console\Commands;

use App\Services\RahjAi\KnowledgeBaseBuilder;
use Illuminate\Console\Command;

class RahjaiBuildKnowledgeBase extends Command
{
    protected $signature = 'rahjai:build-knowledge';
    protected $description = 'Build complete RAHJAI knowledge base from system schema and documentation';

    public function handle()
    {
        $this->info('🔨 Building RAHJAI Knowledge Base...');
        $this->line('This will scan your entire system and create comprehensive documentation.');
        $this->line('');

        if (!$this->confirm('Continue?')) {
            $this->info('Cancelled.');
            return;
        }

        $this->withProgressBar(range(1, 100), function () {
            $builder = app(KnowledgeBaseBuilder::class);
            $builder->buildCompleteKnowledgeBase();
        });

        $this->newLine();
        $this->info('✅ Knowledge base built successfully!');
        $this->line('');
        $this->info('📊 Next steps:');
        $this->line('1. Test a query: php artisan tinker → $svc = app(RtimeDataService::class);');
        $this->line('2. Get account balance: $svc->getAccountBalance(\'RENT\', \'2026-04-10\', 1);');
        $this->line('3. Query RAHJAI: Navigate to the AI chat in your app');
        $this->line('');
        $this->info('💡 Tip: Run this command weekly to keep documentation up-to-date.');
    }
}
