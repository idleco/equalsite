<?php

namespace App\Actions;

use App\Models\Audit;
use App\Value\CrawlerViolation;
use App\Value\CrawlerViolationNode;
use App\Value\Impact;
use App\Value\Status;

class CreateAudit
{
    public function create(string $url, string $crawlId)
    {
        return Audit::create([
            'url' => $url,
            'domain' => parse_url($url, PHP_URL_HOST),
            'status' => Status::Queued,
            'crawler_id' => $crawlId
        ]);
    }
}
