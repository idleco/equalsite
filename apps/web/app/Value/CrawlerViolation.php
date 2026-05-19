<?php

namespace App\Value;

/**
 * @property string[] $tags
 * @property CrawlerViolationNode[] $nodes
 */
class CrawlerViolation
{
    /**
     * @param string[] $tags
     * @param CrawlerViolationNode[] $nodes
     */
    public function __construct(
        public readonly string $id,
        public readonly string $impact,
        public readonly array $tags,
        public readonly string $description,
        public readonly string $help,
        public readonly string $helpUrl,
        public readonly array $nodes
    ) {}

    public static function fromJson(array $value): static
    {
        return new static(
            id: $value['id'],
            impact: $value['impact'],
            tags: $value['tags'],
            description: $value['description'],
            help: $value['help'],
            helpUrl: $value['helpUrl'],
            nodes: collect($value['nodes'])
                ->map(fn(array $array) => CrawlerViolationNode::fromJson($array))
                ->all()
        );
    }
}
