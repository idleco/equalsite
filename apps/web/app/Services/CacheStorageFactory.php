<?php

namespace App\Services;

use App\Contracts\KeyAwareStorage;
use App\Support\CacheStore;

class CacheStorageFactory
{
    public static function progress(string $crawlId): KeyAwareStorage
    {
        return new CacheStore("scan-$crawlId:progress");
    }

    public static function queued(string $crawlId): KeyAwareStorage
    {
        return new CacheStore("scan-$crawlId:queue-position");
    }
}
