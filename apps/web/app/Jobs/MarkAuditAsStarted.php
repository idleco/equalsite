<?php

namespace App\Jobs;

use App\Models\Audit;
use App\Value\Status;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MarkAuditAsStarted implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $crawlerId,
        public string $timestamp
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::channel('crawler')->debug('MarkAuditAsStarted', [
            'type' => 'started',
            'payload' => $this->crawlerId
        ]);

        $audit = Audit::query()
            ->lockForUpdate()
            ->where('crawler_id', $this->crawlerId)
            ->first();

        if ($audit === null) {
            return;
        }

        $audit->update([
            'status' => Status::Started,
            'started_at' => Carbon::parse($this->timestamp)
        ]);
    }
}
