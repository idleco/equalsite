<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function show(string $id)
    {
        $audit = Audit::where('crawler_id', $id)->firstOrFail();

        return Inertia::render('audit/teaser-report', [
            'report' => [
                'auditId' => $audit->crawler_id
            ]
        ]);
    }
}
