<?php

namespace App\Actions;

use App\Models\Audit;
use App\Value\AxeItem;
use App\Value\Impact;

class CreateAuditViolation
{
    public function create(Audit $audit, string $url, AxeItem $violation)
    {
        $model = $audit->violations()->firstOrCreate([
            'rule_id' => $violation->id,
            'impact_level' => Impact::from($violation->impact),
        ], [
            'description' => $violation->description,
            'nodes' => [],
            'help_url' => $violation->helpUrl,
            'failure_summary' => array_first($violation->nodes)?->failureSummary,
        ]);

        foreach ($violation->nodes as $node) {
            $model->nodes->sync([
                'url' => $url,
                'html' => $node->html,
                'target' => array_first($node->target),
            ]);
        }

        $model->save();
    }
}
