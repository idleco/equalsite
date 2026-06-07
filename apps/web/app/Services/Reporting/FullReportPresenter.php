<?php

namespace App\Services\Reporting;

use App\Models\Violation;

class FullReportPresenter extends TeaserReportPresenter
{
    /**
     * @param  list<string>  $discoveredPageUrls
     * @return array{
     *     groupsCount: int,
     *     groups: list<array{
     *         violationId: int,
     *         ruleId: string,
     *         impact: string,
     *         impactLabel: string,
     *         summary: string,
     *         failureSummary: ?string,
     *         helpUrl: ?string,
     *         fixInstruction: ?string,
     *         remediationScope: string,
     *         clusterReason: string,
     *         affectedPagesCount: int,
     *         instancesCount: int,
     *         samplePages: list<string>,
     *         sampleTargets: list<string>,
     *         sampleNodes: list<array{url: string, target: string, html: string, fingerprint: string}>,
     *         affectedPages: list<string>
     *     }>
     * }
     */
    public function remediation(array $discoveredPageUrls): array
    {
        $groups = $this->audit->violations
            ->sort(
                fn(Violation $left, Violation $right): int => $this->compareViolations($left, $right)
            )
            ->map(fn(Violation $violation): array => $this->remediationGroup($violation, $discoveredPageUrls))
            ->values()
            ->all();

        return [
            'groupsCount' => count($groups),
            'groups' => $groups,
        ];
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return array{
     *     violationId: int,
     *     ruleId: string,
     *     impact: string,
     *     impactLabel: string,
     *     summary: string,
     *     failureSummary: ?string,
     *     helpUrl: ?string,
     *     fixInstruction: ?string,
     *     remediationScope: string,
     *     clusterReason: string,
     *     affectedPagesCount: int,
     *     instancesCount: int,
     *     samplePages: list<string>,
     *     sampleTargets: list<string>,
     *     sampleNodes: list<array{url: string, target: string, html: string, fingerprint: string}>,
     *     affectedPages: list<string>
     * }
     */
    private function remediationGroup(Violation $violation, array $discoveredPageUrls): array
    {
        $nodes = collect($violation->nodes ?? [])
            ->map(function (array $node): array {
                $target = $this->normalizeTarget($node['target'] ?? null);

                return [
                    'url' => is_string($node['url'] ?? null) ? $node['url'] : '',
                    'target' => $target,
                    'html' => is_string($node['html'] ?? null) ? $node['html'] : '',
                    'fingerprint' => is_string($node['fingerprint'] ?? null) ? $node['fingerprint'] : '',
                ];
            })
            ->filter(fn(array $node): bool => $node['url'] !== '')
            ->values();

        $discoveredLookup = array_flip($discoveredPageUrls);
        $affectedPages = $nodes
            ->pluck('url')
            ->filter(fn(string $url): bool => isset($discoveredLookup[$url]))
            ->unique()
            ->values()
            ->all();

        $instancesCount = $nodes
            ->pluck('fingerprint')
            ->filter()
            ->unique()
            ->count();

        $sampleTargets = $nodes
            ->pluck('target')
            ->filter()
            ->unique()
            ->take(3)
            ->values()
            ->all();

        $sampleNodes = $nodes
            ->unique(fn(array $node): string => $node['fingerprint'] !== ''
                ? $node['fingerprint']
                : $node['url'] . '|' . $node['target'] . '|' . $node['html'])
            ->take(3)
            ->map(fn(array $node): array => $node)
            ->values()
            ->all();

        $remediationScope = $this->inferRemediationScope(
            $affectedPages,
            $sampleTargets,
            $nodes->pluck('fingerprint')->filter()->unique()->count(),
            count($discoveredPageUrls),
        );

        return [
            'violationId' => $violation->id,
            'ruleId' => $violation->rule_id,
            'impact' => $violation->impact->value,
            'impactLabel' => $violation->impact->getLabel(),
            'summary' => $violation->plain_english_summary ?? str_replace('-', ' ', $violation->rule_id),
            'failureSummary' => $violation->failure_summary,
            'helpUrl' => $violation->help_url,
            'fixInstruction' => $violation->fix_instruction,
            'remediationScope' => $remediationScope,
            'clusterReason' => $this->clusterReason($remediationScope, $affectedPages, $sampleTargets),
            'affectedPagesCount' => count($affectedPages),
            'instancesCount' => $instancesCount,
            'samplePages' => array_slice($affectedPages, 0, 3),
            'sampleTargets' => $sampleTargets,
            'sampleNodes' => $sampleNodes,
            'affectedPages' => $affectedPages,
        ];
    }

    /**
     * @param  list<string>  $affectedPages
     * @param  list<string>  $sampleTargets
     */
    private function inferRemediationScope(
        array $affectedPages,
        array $sampleTargets,
        int $uniqueFingerprints,
        int $discoveredPagesCount,
    ): string {
        if (count($affectedPages) <= 1) {
            return 'page-specific';
        }

        $targetText = strtolower(implode(' ', $sampleTargets));
        $touchesLayoutRegion = str_contains($targetText, 'header')
            || str_contains($targetText, 'nav')
            || str_contains($targetText, 'footer')
            || str_contains($targetText, 'main');

        if ($touchesLayoutRegion && $uniqueFingerprints <= 1) {
            return 'shared-layout';
        }

        if ($discoveredPagesCount > 0 && count($affectedPages) >= (int) ceil($discoveredPagesCount * 0.6)) {
            return 'shared-layout';
        }

        if ($uniqueFingerprints <= 2) {
            return 'shared-component';
        }

        return 'template';
    }

    /**
     * @param  list<string>  $affectedPages
     * @param  list<string>  $sampleTargets
     */
    private function clusterReason(string $remediationScope, array $affectedPages, array $sampleTargets): string
    {
        $targetHint = $sampleTargets[0] ?? 'the affected selector';
        $pageCount = count($affectedPages);

        return match ($remediationScope) {
            'shared-layout' => "This issue repeats across {$pageCount} pages on {$targetHint}, so it is likely a shared layout fix.",
            'shared-component' => "This issue repeats across {$pageCount} pages on {$targetHint}, so it is likely a shared component fix.",
            'template' => "This issue appears across {$pageCount} related pages on {$targetHint}, suggesting a shared template fix.",
            default => "This issue is currently isolated to a specific page or instance near {$targetHint}.",
        };
    }

    private function normalizeTarget(mixed $target): string
    {
        if (is_array($target)) {
            $firstTarget = $target[0] ?? null;

            return is_string($firstTarget) ? $firstTarget : '';
        }

        return is_string($target) ? $target : '';
    }
}
