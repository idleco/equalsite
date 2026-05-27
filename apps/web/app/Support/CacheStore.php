<?php

namespace App\Support;

use App\Contracts\KeyAwareStorage;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Facades\Cache;

class CacheStore implements KeyAwareStorage
{
    protected string $key;

    protected Repository $repository;

    public function __construct(string $key, ?string $driver = null)
    {
        $this->repository = Cache::driver($driver);
        $this->key = $key;
    }

    public function flush(): void
    {
        $this->repository->forget($this->key);
    }

    public function put(mixed $value): void
    {
        $this->repository->put($this->key, $value);
    }

    public function get(): mixed
    {
        return $this->repository->get($this->get());
    }

    public function exists(): bool
    {
        return $this->repository->has($this->key);
    }
}
