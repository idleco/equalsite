<?php

namespace App\Value;

use Illuminate\Contracts\Support\Arrayable;

class SpiderRequestBody implements Arrayable
{
    protected int $maxPages = 15;

    public function __construct(
        protected ?string $url,
    ) {}

    public static function make(?string $url = null): static
    {
        return new static($url);
    }

    public function setUrl(string $value): self
    {
        $this->url = $value;

        return $this;
    }

    public function setMaxPages(int $value): self
    {
        $this->maxPages = $value;

        return $this;
    }

    public function toArray(): array
    {
        return [
            'url' => $this->url,
            'options' => [
                'maxPages' => $this->maxPages
            ]
        ];
    }
}
