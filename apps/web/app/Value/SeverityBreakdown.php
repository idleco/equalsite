<?php

namespace App\Value;

use Illuminate\Contracts\Support\Arrayable;

class SeverityBreakdown implements Arrayable
{
    public function __construct(
        public readonly int $critical,
        public readonly int $serious,
        public readonly int $moderate,
        public readonly int $minor
    ) {}

    public function toArray(): array
    {
        return [
            'critical' => $this->critical,
            'serious' => $this->serious,
            'moderate' => $this->moderate,
            'minor' => $this->minor,
        ];
    }
}
