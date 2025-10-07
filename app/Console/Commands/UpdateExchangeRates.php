<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ExchangeRateService;

class UpdateExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'currency:update-rates 
                            {--provider=frankfurter : API provider to use (frankfurter or exchangerate-api)}
                            {--force : Force update even if recently updated}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update currency exchange rates from external API';

    /**
     * Execute the console command.
     */
    public function handle(ExchangeRateService $exchangeRateService)
    {
        $this->info('🌍 Starting exchange rate update...');
        $this->newLine();

        $provider = $this->option('provider');
        $force = $this->option('force');

        $this->info("Using provider: {$provider}");
        
        if ($force) {
            $this->warn('Force update enabled - bypassing cache check');
        }

        $this->newLine();
        
        // Show progress bar
        $this->output->write('Fetching exchange rates from API...');
        
        $result = $exchangeRateService->updateAllCurrencyRates($provider, $force);

        $this->newLine();
        $this->newLine();

        if ($result['success']) {
            $this->info('✅ ' . $result['message']);
            $this->newLine();
            
            $this->line("Provider: {$result['provider']}");
            $this->line("Date: {$result['date']}");
            $this->line("Currencies Updated: {$result['updated']}");
            
            if (!empty($result['errors'])) {
                $this->newLine();
                $this->warn('⚠️  Some currencies could not be updated:');
                foreach ($result['errors'] as $error) {
                    $this->line('  - ' . $error);
                }
            }
            
            $this->newLine();
            $this->info('🎉 Exchange rate update completed successfully!');
            
            return Command::SUCCESS;
        } else {
            $this->error('❌ ' . $result['message']);
            
            if (isset($result['error'])) {
                $this->error('Error: ' . $result['error']);
            }
            
            if (isset($result['last_update'])) {
                $this->warn('Last update was at: ' . $result['last_update']);
                $this->info('Use --force option to force update');
            }
            
            return Command::FAILURE;
        }
    }
}
