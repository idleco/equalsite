<?php

namespace App\Value;

enum Impact: string
{
    case Critical = 'critical';
    case Serious = 'serious';
    case Moderate = 'moderate';
    case Minor = 'minor';

    public function is(self $compare): bool
    {
        return $this->value === $compare->value;
    }

    public function weight(): int
    {
        return match ($this) {
            self::Critical => 10,
            self::Serious => 7,
            self::Moderate => 3,
            self::Minor => 1,
        };
    }

    public function priority(): int
    {
        return match ($this) {
            self::Critical => 1,
            self::Serious => 2,
            self::Moderate => 3,
            self::Minor => 4,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Critical => 'Critical',
            self::Serious => 'Serious',
            self::Moderate => 'Moderate',
            self::Minor => 'Minor',
        };
    }
}
