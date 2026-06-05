<?php

namespace App\Value;

use App\Models\Audit;
use Illuminate\Contracts\Support\Arrayable;

class ScanProgress implements Arrayable
{
    public function __construct(
        public readonly int $completedRequests,
        public readonly int $pendingRequests,
        public readonly int $totalRequests,
        public readonly int $progressPercentage
    ) {}

    public static function fromAudit(Audit $audit): static
    {
        return static::fromArray(
            $audit->getCustomData('progress_state', [])
        );
    }

    public static function fromArray(array $array): static
    {
        return new static(
            completedRequests: $array['completedRequests'] ?? 0,
            pendingRequests: $array['pendingRequests'] ?? 0,
            totalRequests: $array['totalRequests'] ?? 0,
            progressPercentage: $array['progressPercentage'] ?? 0,
        );
    }

    public function toArray(): array
    {
        return [
            'completedRequests' => 0,
            'pendingRequests' => 0,
            'totalRequests' => 0,
            'progressPercentage' => 0
        ];
    }
}
