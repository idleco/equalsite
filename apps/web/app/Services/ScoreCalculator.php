<?php

namespace App\Services;

use App\Contracts\HealthScoreCalculator;
use App\Models\Audit;
use App\Value\Impact;
use Illuminate\Support\Facades\Log;

class ScoreCalculator implements HealthScoreCalculator
{
    public function calculate(Audit $audit, float $scale = .5): int
    {
        $audit->loadMissing(['violations']);

        $score = 100;

        foreach (Impact::cases() as $impact) {
            $count = $audit->violations->where('impact_level', $impact)->count();
            $score = floor($score - ($count * $impact->weight() * $scale));
        }

        return max(0, $score);
    }
}
