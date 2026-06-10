<?php

namespace App\Actions;

use App\Models\Audit;
use App\Value\CrawlerViolation;
use App\Value\CrawlerViolationNode;
use App\Value\Impact;

class CreateAuditViolation
{
    public function create(
        Audit $audit,
        string $url,
        CrawlerViolation $violation
    ) {
        $model = $audit->violations()->firstOrCreate([
            'rule_id' => $violation->id,
            'impact_level' => Impact::from($violation->impact),
        ], [
            'description' => $violation->description,
            'nodes' => [],
            'help_url' => $violation->helpUrl,
            'failure_summary' => array_first($violation->nodes)->failureSummary,
        ]);

        $nodes = $model->nodes ?? [];

        foreach ($violation->nodes as $node) {
            $target = array_first($node->target);
            $nodes[] = [
                'url' => $url,
                'html' => $node->html,
                'target' => $target,
                'fingerprint' => md5($target . $node->html)
            ];
        }

        $model->update([
            'nodes' => $nodes
        ]);
    }
}
