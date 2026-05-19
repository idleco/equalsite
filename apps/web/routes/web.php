<?php

use App\Http\Controllers\WebsiteScanController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/website-scan', [WebsiteScanController::class, 'store'])->name('website-scan.store');

require __DIR__ . '/settings.php';
