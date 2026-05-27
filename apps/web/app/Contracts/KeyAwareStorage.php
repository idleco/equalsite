<?php

namespace App\Contracts;

interface KeyAwareStorage
{
    public function flush(): void;

    public function put(mixed $value): void;

    public function get(): mixed;

    public function exists(): bool;
}
