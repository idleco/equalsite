import { Head, Link, router, usePage } from '@inertiajs/react';
import ScanTimeline from '@/components/scanning/scan-timeline';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import ScanDetails from '@/components/scanning/scan-details';
import ScanOverview from '@/components/scanning/scan-overview';
import ProcessedUrls from '@/components/scanning/processed-urls';
import { useEchoPublic } from '@laravel/echo-react';
import type { ScanInfo, ScanProgress, ScanQueue, ScannedUrl } from '@/types';
import type { CompletedWsEvent, FailedWsEvent, PageCompletedWsEvent, PageFailedWsEvent, PageSkippedWsEvent, PageStartedWsEvent, ProgressWsEvent, QueuedWsEvent, StartedWsEvent} from '@equalsite/types';
import { omit } from '@/lib/obj';

type ScanProgressPageProps = {
    scanInfo: ScanInfo;
    scanProgress: ScanProgress;
    scanQueue: ScanQueue;
    scanUrls: Record<string, ScannedUrl>;
}

type WsEvents = QueuedWsEvent
    | StartedWsEvent
    | ProgressWsEvent
    | CompletedWsEvent
    | FailedWsEvent
    | PageStartedWsEvent
    | PageFailedWsEvent
    | PageSkippedWsEvent
    | PageCompletedWsEvent;

function Breadcrumbs() {
    const { props } = usePage<ScanProgressPageProps>()
    const { scanInfo } = props
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
                    <BreadcrumbPage>{scanInfo.auditId}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default function ScanProgress({
    scanUrls,
    scanProgress,
    scanInfo,
    scanQueue
}: ScanProgressPageProps) {
    console.log(scanProgress);
    console.log(scanUrls);
    useEchoPublic<WsEvents>(
        `audit-${scanInfo.auditId}-scanning`,
        [
            '.audit.queued', '.audit.started', '.audit.progress', '.audit.completed',
            '.audit.failed', '.audit.page.started', '.audit.page.skipped', '.audit.page.failed',
            '.audit.page.completed'
        ],
        (e) => {
            console.log('WS Event: ', { ...e });
            if (e.type === 'audit.queued') {
                const data = (e as QueuedWsEvent).data;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanQueue: omit(data, ['auditId'])
                    })
                });
            }
            else if (e.type === 'audit.started') {
                const { timestamp } = e as StartedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'started',
                            startedAt: timestamp
                        }
                    })
                });
            }
            else if (e.type === 'audit.progress') {
                const { data } = e as ProgressWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanProgress: { ...data }
                    })
                });
            }
            else if (e.type === 'audit.completed') {
                const { timestamp } = e as CompletedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'completed',
                            completedAt: timestamp
                        }
                    })
                });
            }
            else if (e.type === 'audit.failed') {
                const { error } = (e as FailedWsEvent).data;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanInfo: {
                            ...current.scanInfo,
                            status: 'failed',
                            failureReason: error
                        }
                    })
                });
            }
            else if (e.type === 'audit.page.started') {
                const { data, timestamp } = e as PageStartedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            ...({[data.pageUrl]: {
                                status: 'started',
                                attemptsCount: data.attemptsCount,
                                startedAt: timestamp,
                            }})
                        }
                    })
                });
            }
            else if (e.type === 'audit.page.skipped') {
                const { data, timestamp } = e as PageSkippedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            ...({[data.pageUrl]: {
                                status: 'skipped',
                                skippingReason: data.reason,
                                skippedAt: timestamp,
                            }})
                        }
                    })
                });
            }
            else if (e.type === 'audit.page.failed') {
                const { data, timestamp } = e as PageFailedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            ...({[data.pageUrl]: {
                                ...current.scanUrls[data.pageUrl],
                                status: 'failed',
                                errorMessage: data.errorMessage,
                                attemptsCount: data.attemptsCount,
                                failedAt: timestamp,
                            }})
                        }
                    })
                });
            }
            else if (e.type === 'audit.page.completed') {
                const { data, timestamp } = e as PageCompletedWsEvent;
                router.replace<ScanProgressPageProps>({
                    preserveScroll: true,
                    props: (current) => ({
                        ...current,
                        scanUrls: {
                            ...current.scanUrls,
                            ...({[data.pageUrl]: {
                                ...current.scanUrls[data.pageUrl],
                                status: 'completed',
                                accessibilityViolationsCount: data.accessibilityViolationsCount,
                                severityBreakdown: data.severityBreakdown,
                                completedAt: timestamp,
                            }})
                        }
                    })
                });
            }
        }
    );
    return (
        <>
            <Head title="Welcome" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumbs />
                <ScanDetails scanInfo={scanInfo} scanQueue={scanQueue} />
                <ScanOverview scanProgress={scanProgress} />
                <ProcessedUrls scanUrls={scanUrls} />
                <ScanTimeline />
            </div>
        </>
    );
}
