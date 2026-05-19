<?php

namespace App\Jobs;

use App\Models\Audit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MarkAuditAsFailed implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $crawlerId,
        public string $reason
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::channel('crawler')->debug('MarkAuditAsFailed', [
            'type' => 'failed',
            'payload' => $this->crawlerId
        ]);

        $audit = Audit::query()
            ->lockForUpdate()
            ->where('crawler_id', $this->crawlerId)
            ->first();

        if ($audit === null) {
            return;
        }

        $audit->fail(json_encode($this->reason));
    }
}
