<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AnalyzeController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'url' => ['required']
        ]);


        throw new \Exception('Not implemented');
    }
}
