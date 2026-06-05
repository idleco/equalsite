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

    public static function default(): static
    {
        return new static(
            critical: 0,
            serious: 0,
            moderate: 0,
            minor: 0
        );
    }

    public static function fromArray(array $value): static
    {
        return new static(
            critical: $value['critical'],
            serious: $value['serious'],
            moderate: $value['moderate'],
            minor: $value['minor']
        );
    }

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
