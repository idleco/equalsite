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
            crawlId: $value['auditId'],
            url: $value['pageUrl'],
            violations: collect($value['accessibilityViolations'])
                ->map(fn(array $array) => CrawlerViolation::fromJson($array))
                ->all()
        );
    }
}
