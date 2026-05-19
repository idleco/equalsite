<?php

namespace App\Value;

class CrawlerViolationNode
{
    public function __construct(
        public readonly array $any,
        public readonly array $all,
        public readonly array $none,
        public readonly string $impact,
        public readonly string $html,
        public readonly array $target,
        public readonly string $failureSummary
    ) {}

    public static function fromJson(array $value): static
    {
        return new static(
            any: $value['any'],
            all: $value['all'],
            none: $value['none'],
            impact: $value['impact'],
            html: $value['html'],
            target: $value['target'],
            failureSummary: $value['failureSummary']
        );
    }
}
