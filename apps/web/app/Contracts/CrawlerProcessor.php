<?php

namespace App\Contracts;

interface CrawlerProcessor
{
    public function analyze(string $url, array $options = []);
}
