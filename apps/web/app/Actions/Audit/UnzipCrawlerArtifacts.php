<?php

namespace App\Actions\Audit;

use App\Support\CrawlerArtifacts;
use Illuminate\Support\Facades\File;
use ZipArchive;

class UnzipCrawlerArtifacts
{
    public function unzip(string $crawlId, string $zipFilePath)
    {
        $zip = new ZipArchive();
        $artifacts = new CrawlerArtifacts($crawlId);

        if (! is_dir($artifacts->path())) {
            File::makeDirectory($artifacts->path(), 0755, true);
        }

        if ($zip->open($zipFilePath) === true) {
            $zip->extractTo($artifacts->path());
            $zip->close();
        }
    }
}
