<?php

namespace App\Value;

enum MessageType: string
{
    case Started = 'started';
    case Failed = 'failed';
    case Progress = 'progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
