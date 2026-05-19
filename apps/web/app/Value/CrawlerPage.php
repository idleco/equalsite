<?php

namespace App\Value;

/**
 * @property CrawlerViolation[] $violations
 **/
class CrawlerPage
{
    /**
     * @param CrawlerViolation[] $violations
     */
    public function __construct(
        public readonly string $crawlId,
        public readonly string $url,
        public readonly array $violations
    ) {}

    public static function fromJson(array $value): static
    {
        return new static(
            crawlId: $value['crawlId'],
            url: $value['url'],
            violations: collect($value['violations'])
                ->map(fn(array $array) => CrawlerViolation::fromJson($array))
                ->all()
        );
    }
}
