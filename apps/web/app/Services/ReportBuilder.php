<?php

namespace App\Services;

use App\Models\Audit;
use App\Models\Violation;

class ReportBuilder
{
    public static function remediationWorkspace(Audit $audit)
    {
        $results = [];

        foreach ($audit->violations as $violation) {
            collect($violation->nodes)->groupBy('fingerprint')
            $results[] = [
                'id' => $violation->id,
                'rule_id' => $violation->rule_id,
                'issues' => collect($violation->nodes)->reduce(function (array $acc,  array $node) {
                    $instances = $acc[$node['fingerprint']] ?? [
                        'affected_urls' => [],
                        'target' => $node['target'],
                        'html' => $node['html']
                    ];

                    $instances[$node['fingerprint']]['affected_urls'] = []
                }, [])
            ];
        }
        $audit->violations->groupBy('fingerprint')->map(function (Violation $violation, string $fingerprint) {
            return collect($violation->nodes)->mapWith()
        });
    }
}
