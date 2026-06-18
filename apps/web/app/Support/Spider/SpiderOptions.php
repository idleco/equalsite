<?php

namespace App\Support\Spider;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Arr;
use Override;

class SpiderOptions implements Arrayable
{
    protected array $urls = [];

    protected string $callbackUrl;

    protected bool $enqueueLinks = true;

    protected EnqueueStrategy $enqueueStrategy;

    protected int $maxPages = 50;

    public function __construct(array $urls, string $callbackUrl)
    {
        $this->urls = $urls;
        $this->callbackUrl = $callbackUrl;
        $this->enqueueStrategy = EnqueueStrategy::SameDomain;
    }

    /**
     * @param string | list<int, string> $urls
     */
    public static function make($urls, string $callbackUrl): static
    {
        return new static(
            urls: is_string($urls) ? [$urls] : $urls,
            callbackUrl: $callbackUrl
        );
    }

    public static function fromArray(array $array): static
    {
        return tap(new static(
            urls: $array['urls'],
            callbackUrl: $array['callbackUrl']
        ), function ($instance) use ($array) {
            if ($options = Arr::get($array, 'options', false)) {
                $instance->setOptions($options);
            }
        });
    }

    public function getCallbackUrl(): string
    {
        return $this->callbackUrl;
    }

    public function addUrl(string $url): self
    {
        if (! in_array($url, $this->urls)) {
            $this->urls[] = $url;
        }

        return $this;
    }

    public function getUrls(): array
    {
        return $this->urls;
    }

    public function getOptions(): array
    {
        return [
            'maxPages' => $this->getMaxPages(),
            'enqueueLinks' => $this->getEnqueueLinks(),
            'enqueueStrategy' => $this->getEnqueueStrategy()
        ];
    }

    public function setOptions(array $options): self
    {
        foreach ($options as $name => $value) {
            $this->setOption($name, $value);
        }

        return $this;
    }

    public function setOption(string $name, mixed $value): self
    {
        return value(match ($name) {
            'maxPages' => fn() => $this->setMaxPages($value),
            'enqueueLinks' => fn() => $this->setEnqueueLinks($value),
            'enqueueStrategy' => fn() => $this->setEnqueueStrategy($value),
            default => $this
        });
    }

    public function setMaxPages(int $value): self
    {
        $this->maxPages = $value;

        return $this;
    }

    public function getMaxPages(): int
    {
        return $this->maxPages;
    }

    public function setEnqueueLinks(bool $enable = true): self
    {
        $this->enqueueLinks = $enable;

        return $this;
    }

    public function getEnqueueLinks(): bool
    {
        return $this->enqueueLinks;
    }

    /**
     * @param EnqueueStrategy|string $value
     */
    public function setEnqueueStrategy($value): self
    {
        if (is_string($value)) {
            $value = EnqueueStrategy::from($value);
        }

        $this->enqueueStrategy = $value;

        return $this;
    }

    public function getEnqueueStrategy(): string
    {
        return $this->enqueueStrategy->value;
    }

    public function toArray(): array
    {
        return [
            'urls' => $this->getUrls(),
            'callbackUrl' => $this->getCallbackUrl(),
            'options' => $this->getOptions()
        ];
    }
}
