<?php

namespace EqualSite\Discovery;

use JsonException;
use RuntimeException;

/**
 * Buffers NDJSON chunks from urls-scanner.js and aggregates start / page / done records.
 */
class CrawlerNdjsonBuffer
{
    private string $carry = '';

    /** @var list<string> */
    private array $pages = [];

    private ?string $domain = null;

    private ?string $startUrl = null;

    private bool $sawDone = false;

    public function __construct(
        private readonly ?\Closure $onPage = null,
    ) {}

    public function push(string $chunk): void
    {
        $this->carry .= $chunk;

        while (($pos = strpos($this->carry, "\n")) !== false) {
            $line = substr($this->carry, 0, $pos);
            $this->carry = substr($this->carry, $pos + 1);
            $this->consumeLine($line);
        }
    }

    public function finish(): void
    {
        if ($this->carry === '') {
            return;
        }

        $line = $this->carry;
        $this->carry = '';
        $this->consumeLine($line);
    }

    /**
     * @return array{url: string, domain: string, pages: list<string>}
     */
    public function resultOrFail(): array
    {
        if (! $this->sawDone) {
            throw new RuntimeException('Page discovery stream ended without a done record.');
        }

        if ($this->domain === null || $this->startUrl === null) {
            throw new RuntimeException('Page discovery stream is missing start metadata.');
        }

        return [
            'url' => $this->startUrl,
            'domain' => $this->domain,
            'pages' => $this->pages,
        ];
    }

    private function consumeLine(string $line): void
    {
        $line = trim($line);

        if ($line === '') {
            return;
        }

        try {
            /** @var array<string, mixed> $data */
            $data = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            throw new RuntimeException('Invalid NDJSON line in page discovery output: '.$line, 0, $e);
        }

        $type = $data['type'] ?? null;

        if (! is_string($type)) {
            throw new RuntimeException('Page discovery NDJSON line missing string "type".');
        }

        match ($type) {
            'start' => $this->consumeStart($data),
            'page' => $this->consumePage($data),
            'done' => $this->consumeDone(),
            default => throw new RuntimeException("Unknown page discovery NDJSON type [{$type}]."),
        };
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function consumeStart(array $data): void
    {
        $domain = $data['domain'] ?? null;
        $url = $data['url'] ?? null;

        if (! is_string($domain) || $domain === '') {
            throw new RuntimeException('Page discovery start record missing non-empty domain.');
        }

        if (! is_string($url) || $url === '') {
            throw new RuntimeException('Page discovery start record missing non-empty url.');
        }

        $this->domain = $domain;
        $this->startUrl = $url;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function consumePage(array $data): void
    {
        $url = $data['url'] ?? null;

        if (! is_string($url) || $url === '') {
            throw new RuntimeException('Page discovery page record missing non-empty url.');
        }

        $this->pages[] = $url;

        $this->onPage?->__invoke($url);
    }

    private function consumeDone(): void
    {
        if ($this->sawDone) {
            throw new RuntimeException('Duplicate done record in page discovery stream.');
        }

        $this->sawDone = true;
    }
}
