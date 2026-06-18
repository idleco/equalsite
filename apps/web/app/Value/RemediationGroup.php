<?php

namespace App\Value;

use Illuminate\Contracts\Support\Arrayable;

class RemediationGroup implements Arrayable
{
    public function __construct(
        public readonly string $fingerprint,
        public readonly string $impact,
        public readonly string $target,
        public readonly string $html,
        public readonly float $scorePoints,
        public readonly array $affectedUrls = [],
    ) {}

    public static function fromArray(array $array): static
    {
        return new static(
            fingerprint: $array['fingerprint'],
            impact: $array['impact'],
            target: $array['target'],
            html: $array['html'],
            scorePoints: $array['scorePoints'],
            affectedUrls: $array['affectedUrls'],
        );
    }

    public function toArray()
    {
        return [
            'fingerprint' => $this->fingerprint,
            'impact' => $this->impact,
            'target' => $this->target,
            'html' => $this->html,
            'scorePoints' => $this->scorePoints,
            'affectedUrls' => $this->affectedUrls,
        ];
    }
}
