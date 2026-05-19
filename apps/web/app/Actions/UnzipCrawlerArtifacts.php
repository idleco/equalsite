<?php

namespace App\Actions;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class UnzipCrawlerArtifacts
{
    public function unzip(string $crawlId, string $zipFilePath)
    {
        $zip = new ZipArchive();
        $targetPath = Storage::path('audits/' . $crawlId);

        if (! is_dir($targetPath)) {
            File::makeDirectory($targetPath, 0755, true);
        }

        if ($zip->open($zipFilePath) === true) {
            $zip->extractTo($targetPath);
            $zip->close();
        }
    }
}
