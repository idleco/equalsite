import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { PublicHeader } from '@/components/public-header';
import type { ServerityBreakdown } from '@equalsite/types';
import type { IViolation, RemediationGroup, ReportPages, ScannedUrl } from '@/types';
import { str } from '@/lib/utils';

type ReportSummary = {
    totalIssuesFound: number;
    totalPagesAtRisk: number;
    totalPagesScanned: number;
    totalPagesDiscovered: number;
    scannedAt: string | null;
    completedAt: string | null;
};

type ReportProps = {
    report: {
        auditId: string;
        siteUrl: string;
        healthScore: number;
        severityBreakdown: ServerityBreakdown;
        scannedUrls: Record<string, ScannedUrl>;
        summary: ReportSummary;
        highlights: unknown;
        pages: ReportPages;
        remediation: {
            groups: RemediationGroup[];
            groupsCount: number;
        };
        violations: IViolation[];
    };
};

type ImpactKey = 'critical' | 'serious' | 'moderate' | 'minor';

const IMPACT_ORDER: ImpactKey[] = ['critical', 'serious', 'moderate', 'minor'];

const IMPACT_GROUP_LABELS: Record<ImpactKey, string> = {
    critical: 'screen reader users',
    serious: 'keyboard users',
    moderate: 'low vision users',
    minor: 'general users',
};

const IMPACT_GROUP_SUBTITLES: Record<ImpactKey, string> = {
    critical: 'missing labels and alt text block core flows',
    serious: 'focus management and keyboard navigation issues',
    moderate: 'colour contrast and text sizing falls short',
    minor: 'minor improvements for a better experience',
};

const IMPACT_BADGE_STYLES: Record<ImpactKey, string> = {
    critical: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    serious: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    moderate: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    minor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
};

const IMPACT_ICON_STYLES: Record<ImpactKey, string> = {
    critical: 'text-red-600 dark:text-red-400',
    serious: 'text-orange-600 dark:text-orange-400',
    moderate: 'text-yellow-600 dark:text-yellow-400',
    minor: 'text-slate-500 dark:text-slate-400',
};

function ImpactGroupIcon({ impact }: { impact: ImpactKey }) {
    if (impact === 'critical') {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${IMPACT_ICON_STYLES.critical} shrink-0`}>
                <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" />
                <path d="M13.7 21a2 2 0 01-3.4 0" />
            </svg>
        );
    }
    if (impact === 'serious') {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${IMPACT_ICON_STYLES.serious} shrink-0`}>
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
            </svg>
        );
    }
    if (impact === 'moderate') {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${IMPACT_ICON_STYLES.moderate} shrink-0`}>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        );
    }
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${IMPACT_ICON_STYLES.minor} shrink-0`}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
        </svg>
    );
}

function ScoreGauge({ score }: { score: number }) {
    const circumference = 201;
    const offset = circumference * (1 - score / 100);
    const color = score >= 90 ? 'text-emerald-500' : score >= 70 ? 'text-yellow-500' : 'text-red-500';

    return (
        <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0" aria-hidden="true">
            <circle cx="38" cy="38" r="32" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="7" />
            <circle
                cx="38" cy="38" r="32" fill="none" stroke="currentColor"
                className={color}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 38 38)"
            />
            <text x="38" y="44" textAnchor="middle" fontSize="21" fontWeight="500" className="fill-slate-900 dark:fill-white">
                {score}
            </text>
        </svg>
    );
}

function ViolationCard({ violation }: { violation: IViolation }) {
    const impact = violation.impact as ImpactKey;
    const badgeStyle = IMPACT_BADGE_STYLES[impact] ?? IMPACT_BADGE_STYLES.minor;

    return (
        <article className="flex gap-3.5 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
            <div className="w-16 h-12 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium">{violation.summary}</h3>
                    <span className={`text-xs rounded-full px-2 py-0.5 shrink-0 ${badgeStyle}`}>
                        {impact}
                    </span>
                </div>
                {violation.failureSummary && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2 line-clamp-2">
                        {violation.failureSummary}
                    </p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <path d="M14 2v6h6" />
                        </svg>
                        {violation.affectedPagesCount} {str.plural('page', violation.affectedPagesCount)}
                    </span>
                    {violation.helpUrl && (
                        <a
                            href={violation.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                            ~5 min fix
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

function SubSectionDivider({ type, count }: { type: 'quick-wins' | 'structural-work', count: number }) {
    const isQuickWins = type === 'quick-wins';
    return (
        <div className="flex items-center gap-2 py-1">
            {isQuickWins ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-500 shrink-0">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400 shrink-0">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
            )}
            <span className={`text-xs font-medium ${isQuickWins ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {[isQuickWins ? 'quick wins' : 'structural work', `${count} ${str.plural('issue', count)}`].join(' · ')}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
    );
}

function ImpactGroup({ impact, violations }: { impact: ImpactKey; violations: IViolation[] }) {
    const [open, setOpen] = useState(impact === 'critical');
    const count = violations.length;
    const label = `${count} ${impact}`;

    const quickWins = violations.filter((v) => v.remediationScope === 'page-specific');
    const structuralWork = violations.filter((v) => v.remediationScope !== 'page-specific');

    return (
        <div className="rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                aria-expanded={open}
            >
                <ImpactGroupIcon impact={impact} />
                <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{IMPACT_GROUP_LABELS[impact]}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {IMPACT_GROUP_SUBTITLES[impact]}
                    </span>
                </span>
                <span className={`text-xs rounded-full px-2.5 py-1 whitespace-nowrap ${IMPACT_BADGE_STYLES[impact]}`}>
                    {label}
                </span>
                <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                    {quickWins.length > 0 && (
                        <>
                            <SubSectionDivider type="quick-wins" count={quickWins.length} />
                            {quickWins.map((v) => (
                                <ViolationCard key={v.ruleId} violation={v} />
                            ))}
                        </>
                    )}
                    {structuralWork.length > 0 && (
                        <>
                            <SubSectionDivider type="structural-work" count={structuralWork.length} />
                            {structuralWork.map((v) => (
                                <ViolationCard key={v.ruleId} violation={v} />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Report({ report }: ReportProps) {
    const domain = (() => {
        try { return new URL(report.siteUrl).hostname; } catch { return report.siteUrl; }
    })();

    const pageCount = Object.keys(report.scannedUrls).length;

    const groupedViolations = IMPACT_ORDER.reduce<Record<ImpactKey, IViolation[]>>(
        (acc, key) => {
            acc[key] = report.violations.filter((v) => v.impact === key);
            return acc;
        },
        { critical: [], serious: [], moderate: [], minor: [] },
    );

    const nonEmptyGroups = IMPACT_ORDER.filter((k) => groupedViolations[k].length > 0);

    const quickWinsCount = report.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
    ).length;

    const structuralCount = report.violations.filter(
        (v) => v.impact === 'moderate' || v.impact === 'minor'
    ).length;

    return (
        <>
            <Head title={`Accessibility report for ${domain}`} />

            <PublicHeader />

            <main className="max-w-3xl mx-auto px-6 py-10">
                {/* Score + narrative */}
                <div className="flex items-start gap-5 pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
                    <ScoreGauge score={report.healthScore} />
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z" />
                            </svg>
                            {`${domain} · ${pageCount} ${str.plural('page', pageCount)} scanned`}
                        </p>
                        <h1 className="font-display text-lg font-medium leading-snug" aria-label={`Accessibility score: ${report.healthScore} out of 100`}>
                            {report.summary.totalIssuesFound > 0
                                ? `${report.summary.totalIssuesFound} ${str.plural('issue', report.summary.totalIssuesFound)} found — ${report.summary.totalPagesAtRisk} of ${report.summary.totalPagesScanned} ${str.plural('page', report.summary.totalPagesScanned)} affected`
                                : `no issues found across ${report.summary.totalPagesScanned} ${str.plural('page', report.summary.totalPagesScanned)}`}
                        </h1>
                    </div>
                </div>

                {/* Priority overview */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4">
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-0.5">quick wins</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500">
                            {quickWinsCount} fix{quickWinsCount !== 1 ? 'es' : ''}, high impact — do these first
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-100 dark:bg-slate-800/60 p-4">
                        <p className="text-sm font-medium mb-0.5">structural work</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {structuralCount} fix{structuralCount !== 1 ? 'es' : ''}, needs dev time — plan these
                        </p>
                    </div>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">grouped by who's affected</p>

                <div className="space-y-3">
                    {nonEmptyGroups.length > 0 ? (
                        nonEmptyGroups.map((impact) => (
                            <ImpactGroup
                                key={impact}
                                impact={impact}
                                violations={groupedViolations[impact]}
                            />
                        ))
                    ) : (
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-3">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-600 dark:text-emerald-400">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium">no issues found</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                great news — this site passed all WCAG 2.2 AA checks.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
