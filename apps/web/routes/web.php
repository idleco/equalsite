<?php

use App\Http\Controllers\WebsiteScanController;
use App\Services\CrawlerService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/health', function () {
    $response = Http::withToken(config('services.crawler.secret'))
        ->get('http://crawler:3000/health');
    dd($response->json());
});

// Route::get('/spider', function () {
//     $host = config('services.crawler.host');
//     $port = config('services.crawler.port');
//     $secret = config('services.crawler.secret');

//     $crawler = new CrawlerService($host, $port, $secret);
//     $crawler->crawl('https://marketdragon.ph');
// });

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/website-scan', [WebsiteScanController::class, 'store'])->name('website-scan.store');

require __DIR__ . '/settings.php';
