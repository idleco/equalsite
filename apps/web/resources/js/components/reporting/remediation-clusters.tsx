import type React from 'react';

import { impactToneClasses } from './reportColors';
import type { Remediation } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type RemediationGroup = NonNullable<Remediation>['groups'][number];

type RemediationClustersProps = {
    groups: RemediationGroup[];
};

function titleForScope(scope: string): string {
    switch (scope) {
        case 'shared-layout':
            return 'Likely shared layout fix';
        case 'shared-component':
            return 'Likely shared component fix';
        case 'template':
            return 'Likely shared template fix';
        case 'page-specific':
            return 'Likely page-specific fix';
        default:
            return 'Needs developer review';
    }
}

function renderBoldSegments(
    text: string,
): Array<React.ReactNode> {
    const parts: Array<React.ReactNode> = [];
    const pattern = /\*\*(.+?)\*\*/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
        const matchIndex = match.index;
        const fullMatch = match[0];
        const boldText = match[1];

        if (matchIndex > cursor) {
            parts.push(text.slice(cursor, matchIndex));
        }

        parts.push(
            <strong
                key={`bold-${matchIndex}`}
                className="font-semibold dark:text-slate-900 text-slate-100"
            >
                {boldText}
            </strong>,
        );

        cursor = matchIndex + fullMatch.length;
    }

    if (cursor < text.length) {
        parts.push(text.slice(cursor));
    }

    return parts;
}

export function RemediationClusters({
    groups,
}: RemediationClustersProps) {
    return (
        <div className="grid gap-4 grid-cols-0">
            <div className="space-y-4">
                {groups.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Fix priorities</CardTitle>
                            <CardDescription>No remediation clusters are available yet.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm dark:text-slate-600 text-slate-300">
                            Re-run the audit after page analysis completes to
                            unlock issue clustering and developer evidence.
                        </CardContent>
                    </Card>
                ) : (
                    groups.map((group) => (
                        <Card key={`cluster-${group.violationId}`}>
                            <CardHeader>
                                <CardTitle>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="min-w-0 wrap-break-words whitespace-normal">
                                                {group.summary}
                                            </span>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ring-1 ${impactToneClasses(group.impact)}`}
                                            >
                                                {group.impactLabel}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm dark:text-slate-600 text-slate-300">
                                            {titleForScope(group.remediationScope)}
                                        </div>
                                    </div>
                                </CardTitle>
                                <CardDescription>{`${group.affectedPagesCount} pages impacted · ${group.instancesCount} unique instances`}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm dark:text-slate-600 text-slate-300">
                                <div className="space-y-4">
                                    <div className="text-sm dark:text-slate-600 text-slate-300">
                                        {renderBoldSegments(group.clusterReason)}
                                    </div>

                                    {group.failureSummary ? (
                                        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                                            {renderBoldSegments(group.failureSummary)}
                                        </div>
                                    ) : null}

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold tracking-wide dark:text-slate-500 uppercase text-slate-400">
                                                Where to start
                                            </div>
                                            {group.sampleTargets.length > 0 ? (
                                                group.sampleTargets.map(
                                                    (target) => (
                                                        <div
                                                            key={`${group.violationId}-${target}`}
                                                            className="rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                                        >
                                                            {target}
                                                        </div>
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm dark:text-slate-600 text-slate-300">
                                                    No selector evidence available
                                                    yet.
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold tracking-wide dark:text-slate-500 text-slate-400 uppercase">
                                                HTML evidence
                                            </div>
                                            {group.sampleNodes[0] ? (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>HTML evidence</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {group.sampleNodes[0].html}
                                                    </CardContent>
                                                </Card>
                                            ) : (
                                                <p className="text-sm dark:text-slate-600 text-slate-300">
                                                    No HTML evidence available yet.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <div className="text-xs font-semibold tracking-wide dark:text-slate-500 uppercase text-slate-400">
                                                Affected pages
                                            </div>
                                            <ul className="mt-2 space-y-2">
                                                {group.affectedPages
                                                    .slice(0, 6)
                                                    .map((page) => (
                                                        <li
                                                            key={`${group.violationId}-${page}`}
                                                            className="truncate rounded-md border dark:border-slate-200 px-3 py-2 text-sm dark:text-slate-700 border-slate-800 text-slate-200"
                                                            title={page}
                                                        >
                                                            {page}
                                                        </li>
                                                    ))}
                                            </ul>
                                            {group.affectedPages.length > 6 ? (
                                                <div className="mt-2 text-xs dark:text-slate-500 text-slate-400">
                                                    +
                                                    {group.affectedPages.length - 6}{' '}
                                                    more pages affected
                                                </div>
                                            ) : null}
                                        </div>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Fix instruction</CardTitle>
                                                <CardDescription>
                                                    {group.fixInstruction ?? 'AI-generated remediation guidance will turn this evidence into a developer-friendly fix brief.'}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
