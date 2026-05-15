<?php

namespace App\Services;

use App\Contracts\CrawlerProcessor;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Process;

// https://www.remoterocketship.com/company/technologyadvice/jobs/software-engineer-iii-internal-software-philippines-remote/
// https://www.remoterocketship.com/company/c9staff/jobs/php-laravel-developer-philippines-remote/
// https://www.remoterocketship.com/company/bet-on-talent-io/jobs/php-developer-philippines-remote/
// https://www.remoterocketship.com/company/jway/jobs/backend-developer-laravel-aws-philippines-remote/
// https://www.remoterocketship.com/company/pear-tree/jobs/full-stack-developer-philippines-remote/
// https://www.remoterocketship.com/company/cell5-co-uk/jobs/back-end-engineer-philippines-remote/

class PlaywrightCrawler implements CrawlerProcessor
{
    public function analyze(string $url, array $options = [])
    {
        $jsFile = base_path('scripts/crawler/crawler.js');
        $process = Process::timeout(120)->idleTimeout(30)->start("node {$jsFile}");

        // run node crawlee script using symfony process
    }

    protected function runNodeDiscoveryNdjson(string $binPath, array $arguments = [], ?\Closure $onPage = null, array $extraEnv = []): array
    {
        $process = new Process(['node', $binPath, ...$arguments]);
        $process->setTimeout(120);
        $process->start(null, $extraEnv);

        $ndjson = new DiscoveryNdjsonBuffer($onPage);

        while ($process->isRunning()) {
            $process->checkTimeout();
            $ndjson->push($process->getIncrementalOutput());
            usleep(2000);
        }

        $process->wait();

        while (($chunk = $process->getIncrementalOutput()) !== '') {
            $ndjson->push($chunk);
        }

        $ndjson->finish();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        return $ndjson->resultOrFail();
    }
}
