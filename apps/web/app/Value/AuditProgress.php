<?php

namespace App\Value;

use DateTimeInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Carbon;

class AuditProgress implements Arrayable
{
    public function __construct(
        public readonly string $currentUrl,
        public readonly SeverityBreakdown $severityBreakdown,
        public readonly DateTimeInterface $receivedAt,
        public readonly int $pagesPending = 0,
        public readonly int $pagesCompleted = 0,
        public readonly int $pagesTotal = 0,
        public readonly int $violations = 0,
        public readonly int $progress = 0,
    ) {}

    public static function fromArray(array $value): static
    {
        return new AuditProgress(
            pagesCompleted: $value['pagesCompleted'],
            pagesPending: $value['pagesPending'],
            pagesTotal: $value['pagesTotal'],
            currentUrl: $value['currentUrl'],
            violations: $value['violations'],
            progress: $value['progress'],
            severityBreakdown: SeverityBreakdown::fromArray($value['severityBreakdown']),
            receivedAt: Carbon::parse($value['receivedAt']),
        );
    }

    public function toArray(): array
    {
        return [
            'pagesCompleted' => $this->pagesCompleted,
            'pagesPending' => $this->pagesPending,
            'pagesTotal' => $this->pagesTotal,
            'currentUrl' => $this->currentUrl,
            'violations' => $this->violations,
            'progress' => $this->progress,
            'severityBreakdown' => $this->severityBreakdown->toArray(),
            'receivedAt' => Carbon::parse($this->receivedAt)->toDateTimeString(),
        ];
    }
}
