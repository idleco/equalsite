<?php

namespace App\Services;

use App\Contracts\CacheProgressRepository;
use App\Value\AuditProgress;
use Illuminate\Support\Facades\Cache;
use Override;

class AuditProgressCacher implements CacheProgressRepository
{
    #[Override]
    public function get(string $key)
    {
        $cached = Cache::get(static::cacheKey($key), []);

        return collect($cached)
            ->map(fn(array $item) => AuditProgress::fromArray($item))
            ->all();
    }

    #[Override]
    public function push(string $key, array $value): void
    {
        $cached = $this->get($key);

        $cached[] = AuditProgress::fromArray([
            'pagesPending' => $value['pagesPending'],
            'pagesCompleted' => $value['pagesCompleted'],
            'pagesTotal' => $value['pagesTotal'],
            'currentUrl' => $value['currentUrl'],
            'violations' => $value['violations'],
            'progress' => $value['progress'],
            'severityBreakdown' => $value['severityBreakdown'],
            'receivedAt' => $value['receivedAt'],
        ]);

        $this->put($key, $cached);
    }

    #[Override]
    public function put(string $key, array $value): void
    {
        Cache::put(
            static::cacheKey($key),
            collect($value)
                ->map(
                    fn($item) => $item instanceof AuditProgress
                        ? $item
                        : AuditProgress::fromArray($item)
                )->toArray()
        );
    }

    #[Override]
    public function forget(string $key): void
    {
        Cache::forget(static::cacheKey($key));
    }

    protected static function cacheKey(string $key)
    {
        return "audit-{$key}:progress";
    }
}
