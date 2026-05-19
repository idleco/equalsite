<?php

namespace App\Value;

enum Impact: string
{
    case Critical = 'critical';
    case Serious = 'serious';
    case Moderate = 'moderate';
    case Minor = 'minor';
}
