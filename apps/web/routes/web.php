<?php

use App\Http\Controllers\Audit\ScanController;
use App\Http\Controllers\WebsiteScanController;
use App\Support\CrawlerHttpClient;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/stats', function (CrawlerHttpClient $client) {
    dd($client->stats());
});

Route::get('/audit/{id}/scanning', ScanController::class)->name('audit.scanning');

Route::post('/website-scan', [WebsiteScanController::class, 'store'])->name('website-scan.store');

require __DIR__ . '/settings.php';
