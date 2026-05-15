<?php

use App\Http\Controllers\AnalyzeController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/spider', function () {
    $response = Http::get('http://crawler:3000/health');

    dd($response->json());
});

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/analyze', AnalyzeController::class);

require __DIR__.'/settings.php';
