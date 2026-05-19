<?php

namespace App\Support;

use App\Value\CrawlerPage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class CrawlerArtifacts
{
    public function __construct(
        protected readonly string $crawlId
    ) {}

    /** @return \App\Value\CrawlerPage[] */
    public function pages(): array
    {
        $pattern = $this->path('datasets/default/*.json');

        return collect(File::glob($pattern))
            ->map(fn(string $path) => File::json($path))
            ->map(fn(array $array) => CrawlerPage::fromJson($array))
            ->all();
    }

    public function path(?string $path): string
    {
        return Storage::path("audits/{$this->crawlId}/" . ($path ?? ''));
    }
}
