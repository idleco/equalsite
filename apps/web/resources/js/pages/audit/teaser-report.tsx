import { Head, Link } from '@inertiajs/react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ScoreGuage from '@/components/reporting/score-guage';
import { Stack } from '@/components/stack';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ServerityBreakdown } from '@equalsite/types';
import type { RemediationGroup, ReportPages, ScannedUrl } from '@/types';
import { RemediationClusters } from '@/components/reporting/remediation-clusters';
import { useState } from 'react';
import { DiscoveredPages } from '@/components/reporting/discovered-pages';
import { DeveloperTargets } from '@/components/reporting/developer-targets';

export const REPORT_TABS = [
    'Fix priorities',
    'By page',
    'Developer targets',
] as const;

type TeaserReportProps = {
    report: {
        auditId: string;
        siteUrl: string;
        healthScore: number;
        severityBreakdown: ServerityBreakdown;
        scannedUrls: Record<string, ScannedUrl>;
        remediation: {
            groups: RemediationGroup[];
            groupsCount: number;
        };
        pages: ReportPages;
    };
}

function Breadcrumbs({ auditId }: { auditId: string }) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Scan</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">{auditId}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Accessibility Report</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default function TeaserReport({
    report,
}: TeaserReportProps) {
    console.log(report)
    const [activeTab, setActiveTab] = useState<(typeof REPORT_TABS)[number]>('Fix priorities');
    return (
        <>
            <Head title="Welcome" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumbs auditId={report.auditId} />
                <Card>
                    <CardContent>
                        <Stack direction="row" gap="md">
                            <ScoreGuage
                                value={report.healthScore}
                                min={0}
                                max={100}
                                className="border rounded-xl"
                                aria-label={`Accessibility score: ${report.healthScore} out of 100`}
                            />
                            <div className="flex-1 grid grid-cols-4 gap-4">
                                <div className="col-span-3 grid grid-cols-2 gap-4">
                                    <div className="grid grid-rows-2 gap-4">
                                        <div className="border rounded-xl flex flex-col justify-around p-4">
                                            <div className="text-lg font-medium text-chart-5/80">
                                                Critical
                                            </div>
                                            <div className="flex">
                                                <div className="text-4xl self-center flex-1 justify-center">
                                                    {report.severityBreakdown.critical}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border rounded-xl flex flex-col justify-around p-4">
                                            <div className="text-lg font-medium text-chart-3/80">
                                                Serious
                                            </div>
                                            <div className="flex">
                                                <div className="text-4xl self-center flex-1 justify-center">
                                                    {report.severityBreakdown.serious}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-rows-2 gap-4">
                                        <div className="border rounded-xl flex flex-col justify-around p-4">
                                            <div className="text-lg font-medium text-chart-1/80">
                                                Moderate
                                            </div>
                                            <div className="flex">
                                                <div className="text-4xl self-center flex-1 justify-center">
                                                    {report.severityBreakdown.moderate}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border rounded-xl flex flex-col justify-around p-4">
                                            <div className="text-lg font-medium text-chart-2/80">
                                                Minor
                                            </div>
                                            <div className="flex">
                                                <div className="text-4xl self-center flex-1 justify-center">
                                                    {report.severityBreakdown.minor}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-xl text-center p-4 flex">
                                    <div className="flex-1 self-center justify-center">
                                        <Button>Download</Button>
                                        <p className="mt-2 text-sm">
                                            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Stack>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Remediation workspace</CardTitle>
                        <CardDescription>
                            Use the paid report lenses below to fix shared issues first, then verify the affected pages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs
                            value={activeTab}
                            onValueChange={(nextTab) => {
                                const typed =
                                nextTab as (typeof REPORT_TABS)[number];

                                if (!REPORT_TABS.includes(typed)) {
                                    return;
                                }

                                setActiveTab(typed);
                            }}
                            className="flex flex-col"
                        >
                            <TabsList variant="line">
                                {REPORT_TABS.map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <TabsContent value="Fix priorities">
                                <RemediationClusters groups={report.remediation.groups} />
                            </TabsContent>
                            <TabsContent value="By page">
                                <DiscoveredPages
                                    title="Detailed findings by page"
                                    subtitle="Use this view to confirm which URLs should improve after a shared fix ships."
                                    pageUrls={report.pages.discovered}
                                    emptyLabel="No pages discovered yet."
                                />
                            </TabsContent>
                            <TabsContent value="Developer targets">
                                <DeveloperTargets
                                    groups={report.remediation.groups}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
