<?php

use App\Http\Controllers\Audit\ScanningController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::inertia('/audit/create', 'audit/scan-request')
    ->name('audit.scan.create');

Route::post('/audit', [ScanningController::class, 'store'])->name('scanning.store');
Route::delete('/audit/{id}', [ScanningController::class, 'cancel'])->name('scanning.cancel');
Route::get('/audit/{id}', [ScanningController::class, 'progress'])->name('scanning.progress');

require __DIR__ . '/settings.php';
