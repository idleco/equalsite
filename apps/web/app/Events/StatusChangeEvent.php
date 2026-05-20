<?php

namespace App\Events;

use App\Value\Status;

interface StatusChangeEvent
{
    public function crawlerId(): string;

    public function getStatus(): Status;
}
