<?php

namespace App\Contracts;

use App\Value\AuditProgress;

interface CacheProgressRepository
{
    /** @return AuditProgress[] */
    public function get(string $key);

    public function push(string $key, array $value): void;

    /** @param AuditProgress[] $value */
    public function put(string $key, array $value): void;

    public function forget(string $key): void;
}
