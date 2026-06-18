<?php

namespace App\Contracts;

use App\Support\Spider\SpiderOptions;

/**
 * @see "packages/types/src/node/api.ts"
 * */
interface Spider
{
    public function ping();

    public function create(SpiderOptions $options);

    public function cancel(string $id);
}
