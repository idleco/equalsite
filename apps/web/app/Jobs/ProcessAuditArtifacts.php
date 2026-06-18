<?php

namespace App\Jobs;

use App\Actions\CreateAuditViolation;
use App\Contracts\ArtifactRepository;
use App\Models\Audit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessAuditArtifacts implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $crawlerId
    ) {}

    public function handle(CreateAuditViolation $violationCreator, ArtifactRepository $repository): void
    {
        /** @var Audit */
        $audit = Audit::query()
            ->where('crawler_id', $this->crawlerId)
            ->firstOrFail();

        $result = $repository->getAxeResults($audit->crawler_id);

        foreach ($result as $page) {
            foreach ($page->violations as $violation) {
                $violationCreator->create(
                    $audit,
                    $page->url,
                    $violation
                );
            }
        }
    }
}
