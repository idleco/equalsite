<?php

namespace App\Jobs;

use App\Actions\CreateAuditViolation;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessCrawlerArtifacts implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $crawlerId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(CreateAuditViolation $violationCreator): void
    {
        /** @var Audit */
        $audit = Audit::query()
            ->where('crawler_id', $this->crawlerId)
            ->firstOrFail();

        $result = $audit->artifacts()->pages();

        foreach ($result as $page) {
            foreach ($page->violations as $violation) {
                $violationCreator->create(
                    $audit,
                    $page->url,
                    $violation
                );
            }
        }

        $audit->update([
            'status' => Status::Completed,
            'completed_at' => now()
        ]);
    }
}
