<?php

namespace App\Value;

use App\Models\Audit;
use Illuminate\Contracts\Support\Arrayable;

class ScanQueue implements Arrayable
{
    public function __construct(
        public readonly int $position,
        public readonly int $ahead,
        public readonly int $waiting
    ) {}

    public static function fromAudit(Audit $audit): static
    {
        return static::fromArray(
            $audit->getCustomData('queue_state', [
                'position' => -1,
                'ahead' => 0,
                'waiting' => 0,
            ])
        );
    }

    public static function fromArray(array $array): static
    {
        return new static(
            position: $array['position'],
            ahead: $array['ahead'],
            waiting: $array['waiting']
        );
    }

    public function toArray(): array
    {
        return [
            'position' => $this->position,
            'ahead' => $this->ahead,
            'waiting' => $this->waiting,
        ];
    }
}
