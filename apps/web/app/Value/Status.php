<?php

namespace App\Value;

enum Status: string
{
    case Pending = 'pending';
    case Started = 'started';
    case Cancelled = 'cancelled';
    case Failed = 'failed';
    case Completed = 'completed';

    public function pending(): bool { return $this === self::Pending; }
    public function started(): bool { return $this === self::Started; }
    public function failed(): bool { return $this === self::Failed; }
    public function completed(): bool { return $this === self::Completed; }
    public function cancelled(): bool { return $this === self::Cancelled; }
}
