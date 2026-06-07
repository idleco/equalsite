<?php

namespace App\Services\Reporting;

use App\Models\Violation;
use EqualSite\Contracts\Accessibility\ImpactLevel;
use EqualSite\Contracts\Audit\Reports\TeaserReportPayload as TeaserReportPayloadContract;

class TeaserReportPresenter extends BasePresenter
{
    public function healthScore(): float
    {
        $score = 100;
        $violations = $this->audit->violations;
        foreach ($violations as $violation) {
            $score -= $violation->impact->getScoreDeduction();
        }

        return (int) max(0, $score);
    }

    /**
     * @return array{
     *     totalIssuesFound: int,
     *     totalPagesAtRisk: int,
     *     totalPagesScanned: int,
     *     totalPagesDiscovered: int,
     *     scannedAt: ?string,
     *     completedAt: ?string
     * }
     */
    public function summary(array $discoveredPageUrls): array
    {
        $pagesAtRisk = $this->totalPagesAtRisk($discoveredPageUrls);
        $pagesAtRiskCount = max(
            collect($pagesAtRisk)
                ->filter(fn(array $page): bool => ($page['issuesFound'] ?? 0) > 0)
                ->count(),
            collect($this->violationsByDiscoveredPageUrl($discoveredPageUrls))
                ->filter(fn(array $violations): bool => $violations !== [])
                ->count(),
        );

        $pagesScannedCount = count($this->audit->pages_scanned ?? []);

        return [
            'totalIssuesFound' => $this->audit->violations()->count(),
            'totalPagesAtRisk' => $pagesAtRiskCount,
            'totalPagesScanned' => max(count($discoveredPageUrls), $pagesScannedCount),
            'totalPagesDiscovered' => count($discoveredPageUrls),
            'scannedAt' => $this->audit->created_at?->toIso8601String(),
            'completedAt' => $this->audit->updated_at?->toIso8601String(),
        ];
    }

    public function severityBreakdown(): array
    {
        return collect(ImpactLevel::cases())
            ->sortBy(fn(ImpactLevel $impact) => $impact->priority())
            ->map(fn(ImpactLevel $impact) => [
                'label' => $impact->getLabel(),
                'count' => $this->legalTargetCount($impact),
            ])
            ->toArray();
    }

    /**
     * @return array{severity: list<array{key: string, label: string, count: int}>}
     */
    public function breakdown(): array
    {
        return [
            'severity' => collect(ImpactLevel::cases())
                ->sortBy(fn(ImpactLevel $impact) => $impact->priority())
                ->map(fn(ImpactLevel $impact) => [
                    'key' => $impact->value,
                    'label' => $impact->getLabel(),
                    'count' => $this->legalTargetCount($impact),
                ])
                ->values()
                ->all(),
        ];
    }

    public function legalTargetCount(ImpactLevel $impact): int
    {
        return $this->audit->violations()
            ->where('impact', $impact)
            ->count();
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return list<array{url: string, issuesFound: int}>
     */
    public function totalPagesAtRisk(array $discoveredPageUrls): array
    {
        $issuesFoundByUrl = $this->audit->violations
            ->flatMap(fn(Violation $violation) => collect($violation->nodes ?? [])
                ->filter(fn(array $node): bool => is_string($node['url'] ?? null) && $node['url'] !== '')
                ->map(fn(array $node): array => [
                    'url' => $node['url'],
                    'violation_id' => $violation->id,
                ]))
            ->unique(fn(array $item): string => $item['url'] . '|' . $item['violation_id'])
            ->countBy('url');

        return collect($discoveredPageUrls)
            ->filter(fn($url): bool => is_string($url) && $url !== '')
            ->map(fn(string $pageUrl) => [
                'url' => $pageUrl,
                'issuesFound' => (int) $issuesFoundByUrl->get($pageUrl, 0),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return array{discovered: list<string>, atRisk: list<array{url: string, issuesFound: int}>, violationsByUrl: array<string, list<array{id: int, ruleId: string, impact: string, impactLabel: string, summary: string, instancesOnPage: int, helpUrl: ?string}>>}
     */
    public function pages(array $discoveredPageUrls): array
    {
        return [
            'discovered' => $discoveredPageUrls,
            'atRisk' => $this->totalPagesAtRisk($discoveredPageUrls),
            'violationsByUrl' => $this->violationsByDiscoveredPageUrl($discoveredPageUrls),
        ];
    }

    /**
     * Violations that include at least one node on the given URL, keyed by URL (camelCase for Inertia).
     *
     * @param  list<string>  $discoveredPageUrls
     * @return array<string, list<array{id: int, ruleId: string, impact: string, impactLabel: string, summary: string, instancesOnPage: int, helpUrl: ?string}>>
     */
    public function violationsByDiscoveredPageUrl(array $discoveredPageUrls): array
    {
        /** @var array<string, list<array<string, mixed>>> $byUrl */
        $byUrl = [];
        foreach ($discoveredPageUrls as $pageUrl) {
            if (! is_string($pageUrl) || $pageUrl === '') {
                continue;
            }
            $byUrl[$pageUrl] = [];
        }

        if ($byUrl === []) {
            return [];
        }

        $violations = $this->audit->violations()->get();

        foreach (array_keys($byUrl) as $pageUrl) {
            $items = [];
            foreach ($violations as $violation) {
                $nodesOnPage = collect($violation->nodes ?? [])
                    ->filter(fn(array $node): bool => ($node['url'] ?? '') === $pageUrl);

                if ($nodesOnPage->isEmpty()) {
                    continue;
                }

                $items[] = [
                    'id' => $violation->id,
                    'ruleId' => $violation->rule_id,
                    'impact' => $violation->impact->value,
                    'impactLabel' => $violation->impact->getLabel(),
                    'summary' => $violation->plain_english_summary ?? str_replace('-', ' ', $violation->rule_id),
                    'instancesOnPage' => $nodesOnPage->pluck('fingerprint')->unique()->count(),
                    'helpUrl' => $violation->help_url,
                ];
            }

            usort(
                $items,
                fn(array $a, array $b): int => ImpactLevel::from((string) $a['impact'])->priority()
                    <=> ImpactLevel::from((string) $b['impact'])->priority()
            );

            $byUrl[$pageUrl] = $items;
        }

        return $byUrl;
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return array{
     *     topIssues: list<array{
     *         id: int,
     *         ruleId: string,
     *         impact: string,
     *         impactLabel: string,
     *         summary: string,
     *         failureSummary: ?string,
     *         helpUrl: ?string,
     *         affectedPagesCount: int,
     *         instancesCount: int,
     *         samplePageUrl: ?string
     *     }>
     * }
     */
    public function highlights(array $discoveredPageUrls): array
    {
        $topIssues = $this->audit->violations
            ->sort(
                fn(Violation $left, Violation $right): int => $this->compareViolations($left, $right)
            )
            ->take($this->visibleIssueLimit())
            ->map(fn(Violation $violation): array => $this->topIssue($violation, $discoveredPageUrls))
            ->values()
            ->all();

        return ['topIssues' => $topIssues];
    }

    /**
     * @return array{
     *     isPaid: bool,
     *     remediationQuote: ?float,
     *     unlockedFindingsCount: int,
     *     hiddenFindingsCount: int,
     *     hiddenPagesCount: int,
     *     upgradeUrl: ?string,
     *     downloadUrl: ?string
     * }
     */
    public function teaser(array $discoveredPageUrls): array
    {
        $totalViolations = $this->audit->violations()->count();
        $visibleFindingsCount = min($totalViolations, $this->visibleIssueLimit());

        return [
            'isPaid' => $this->audit->unlocksFullReport(),
            'remediationQuote' => $this->estimatedRemediationQuote(),
            'unlockedFindingsCount' => $visibleFindingsCount,
            'hiddenFindingsCount' => max(0, $totalViolations - $visibleFindingsCount),
            'hiddenPagesCount' => max(0, count($discoveredPageUrls) - count($this->visibleDiscoveredPageUrls($discoveredPageUrls))),
            'upgradeUrl' => null,
            'downloadUrl' => null,
        ];
    }

    /**
     * @return array{
     *     pageDiscoveryCompleted: bool,
     *     pageAnalysisCompleted: bool,
     *     reportGenerated: bool,
     *     failureMessage: ?string
     * }
     */
    public function progress(): array
    {
        $steps = $this->audit->steps ?? [];

        return [
            'pageDiscoveryCompleted' => (bool) ($steps['page_discovery'] ?? false),
            'pageAnalysisCompleted' => (bool) ($steps['page_analysis'] ?? false),
            'reportGenerated' => (bool) ($steps['generate_reports'] ?? false),
            'failureMessage' => $this->audit->failure_message,
        ];
    }

    protected function compareViolations(Violation $left, Violation $right): int
    {
        $impactComparison = $left->impact->priority() <=> $right->impact->priority();

        if ($impactComparison !== 0) {
            return $impactComparison;
        }

        return $this->violationInstanceCount($right) <=> $this->violationInstanceCount($left);
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return array{
     *     id: int,
     *     ruleId: string,
     *     impact: string,
     *     impactLabel: string,
     *     summary: string,
     *     failureSummary: ?string,
     *     helpUrl: ?string,
     *     affectedPagesCount: int,
     *     instancesCount: int,
     *     samplePageUrl: ?string
     * }
     */
    private function topIssue(Violation $violation, array $discoveredPageUrls): array
    {
        $nodes = collect($violation->nodes ?? []);
        $discoveredUrlLookup = array_flip($discoveredPageUrls);
        $samplePageUrl = $nodes
            ->pluck('url')
            ->filter(fn(?string $url): bool => is_string($url) && $url !== '')
            ->first(fn(string $url): bool => isset($discoveredUrlLookup[$url]));

        return [
            'id' => $violation->id,
            'ruleId' => $violation->rule_id,
            'impact' => $violation->impact->value,
            'impactLabel' => $violation->impact->getLabel(),
            'summary' => $violation->plain_english_summary ?? str_replace('-', ' ', $violation->rule_id),
            'failureSummary' => $violation->failure_summary,
            'helpUrl' => $violation->help_url,
            'affectedPagesCount' => $nodes
                ->pluck('url')
                ->filter(fn(?string $url): bool => is_string($url) && $url !== '')
                ->unique()
                ->count(),
            'instancesCount' => $this->violationInstanceCount($violation),
            'samplePageUrl' => $samplePageUrl,
        ];
    }

    private function violationInstanceCount(Violation $violation): int
    {
        return collect($violation->nodes ?? [])
            ->map(fn(array $node): string => (string) ($node['fingerprint'] ?? ''))
            ->filter()
            ->unique()
            ->count();
    }

    /**
     * Mirrors {@see \EqualSite\Hexagon\Audit\Domain\Model\Violation::calculateRemediationCost()} for persisted rows.
     */
    private function remediationCostForViolation(Violation $violation): float
    {
        $nodes = $violation->nodes ?? [];
        $fingerprints = collect($nodes)->pluck('fingerprint')->filter()->unique();
        $uniqueCount = $fingerprints->count();
        $total = count($nodes);
        $weight = $violation->impact->getWeight();

        return (float) (($uniqueCount * $weight) + (($total - $uniqueCount) * 2));
    }

    private function estimatedRemediationQuote(): ?float
    {
        $sum = 0.0;
        foreach ($this->audit->violations as $violation) {
            $sum += $this->remediationCostForViolation($violation);
        }

        return round($sum, 2);
    }

    /**
     * @param  list<string>  $discoveredPageUrls
     * @return list<string>
     */
    private function visibleDiscoveredPageUrls(array $discoveredPageUrls): array
    {
        if ($this->audit->unlocksFullReport()) {
            return $discoveredPageUrls;
        }

        return array_values(array_slice($discoveredPageUrls, 0, 3));
    }

    private function visibleIssueLimit(): int
    {
        return $this->audit->unlocksFullReport() ? PHP_INT_MAX : 3;
    }
}
