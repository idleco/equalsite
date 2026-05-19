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

        $nodes = collect($violation->nodes)
            ->map(fn(CrawlerViolationNode $node) => [
                'url' => $url,
                'html' => $node->html,
                'target' => array_first($node->target),
            ])->map(fn(array $node) => array_merge($node, [
                'fingerprint' => md5($node['target'] . $node['html'])
            ]))->all();

        $model->update([
            'nodes' => $nodes
        ]);
    }
}
