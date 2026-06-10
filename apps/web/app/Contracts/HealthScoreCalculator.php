<?php

namespace App\Contracts;

use App\Models\Audit;

interface HealthScoreCalculator
{
    public function calculate(Audit $audit): int;
}
