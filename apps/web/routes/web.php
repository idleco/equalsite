<?php

use App\Http\Controllers\Audit\CancelAuditController;
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

Route::delete('/audit/{id}/cancel', CancelAuditController::class)
    ->name('audit.scan.cancel');

Route::get('/audit/{id}', ScanController::class)
    ->name('audit.scan.progress');


Route::post('/website-scan', [WebsiteScanController::class, 'store'])
    ->name('website-scan.store');

require __DIR__ . '/settings.php';
