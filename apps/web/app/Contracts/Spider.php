<?php

namespace App\Contracts;

interface Spider
{
    public function ping();

    public function create(string $url, string $callback, array $options = []);

    public function cancel(string $id);
}
