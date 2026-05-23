import { Form, Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Stack } from '@/components/stack';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { store } from '@/actions/App/Http/Controllers/WebsiteScanController';
import { useEchoPublic } from '@laravel/echo-react';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import ScanningMetrics from '@/components/scanning-metrics';
import ScanningDetails from '@/components/scanning-details';
import ScanningCrawlOverview from '@/components/scanning-crawl-overview';
import ScanningProcessedUrls from '@/components/scanning-processed-urls';
import ScanningTimeline from '@/components/scanning-timeline';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

type Status = 'queued' | 'started' | 'cancelled' | 'failed' | 'completed';

type EventType = 'audit.progress' | 'audit.updated';
interface EventData<T> {
    event: EventType;
    data: T;
}

interface Stats {
    concurrency: number;
    failedRequests: number;
    pendingRequests: number;
    processedRequests: number;
    totalRequests: number;
}

interface AuditUpdated {
    cancelledAt?: string;
    completedAt?: string;
    id: string;
    startedAt?: string;
    status: { value: Status };
    stats?: Stats
}

interface AuditProgress {
    violations: number;
    id: string;
    url: string;
    stats: Stats
}

type UrlData = {
    url: string;
    violations: number;
}

type Props = {
    canRegister?: boolean
    audit: {
        id: string;
        url: string;
        urls: UrlData[];
        failureReason?: string;
        startedAt?: string;
        completedAt?: string;
        cancelledAt?: string;
        createdAt: string;
        status: { value: Status };
    }
}

function unique(urls: UrlData[]) {
    return [...new Map(urls.map((i) => [i.url, i])).values()];
}

export default function Scanning({
    audit,
    canRegister = true,
}: Props) {
    const { urls, ...restAudit } = audit;
    const { auth } = usePage().props;
    const [data, setData] = useState(restAudit);
    const [output, setOutput] = useState<UrlData[]>(urls);
    const [stats, setStats] = useState<Stats>({
        concurrency: 0,
        failedRequests: 0,
        pendingRequests: 0,
        processedRequests: 0,
        totalRequests: 0,
    })

    useEchoPublic<EventData<AuditUpdated | AuditProgress>>(
        `audits.${audit.id}`,
        ['.audit.updated', '.audit.progress'],
        (e) => {
            if (e.event === 'audit.updated') {
                const data = e.data as AuditUpdated;
                if (data.stats) {
                    setStats({ ...data.stats });
                }

                setData((prev) => ({
                    ...prev,
                    cancelledAt: data.cancelledAt,
                    completedAt: data.completedAt,
                    startedAt: data.startedAt,
                    status: data.status
                }));
            }

            else if (e.event === 'audit.progress') {
                const data = e.data as AuditProgress;
                setStats({ ...data.stats });
                setOutput(
                    prev => unique([
                        ...prev,
                        { url: data.url, violations: data.violations }
                    ])
                );
            }
        },
        [audit]
    );
    return (
        <>
            <Head title="Welcome" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Scan</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>8222</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <ScanningDetails />
                <ScanningCrawlOverview />
                <ScanningProcessedUrls />
                <ScanningTimeline />
            </div>
            {/* <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                    <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0 border">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <Stack direction="col">
                                <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                                    {data.status.value}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed sm:text-base">
                                    Started: {data.startedAt} <br />
                                    Completed: {data.completedAt} <br />
                                    Cancelled: {data.cancelledAt} <br />
                                    Created: {data.createdAt} <br />
                                </p>
                                <p className="mt-2 text-sm leading-relaxed sm:text-base">
                                    Total: {stats.totalRequests} <br />
                                    Pending: {stats.pendingRequests} <br />
                                    Processed: {stats.processedRequests} <br />
                                    Failures: {stats.failedRequests} <br />
                                </p>
                                <Stack direction="col">
                                    {output.map(i => (
                                        <Stack direction="row" key={i.url}>
                                            <div className="border flex-1">{i.url}</div>
                                            <div>{i.violations}</div>
                                        </Stack>
                                    ))}
                                </Stack>
                                <Form action={store().url} method={store().method}>
                                    {({ processing, errors }) => (
                                        <Stack
                                            gap="lg"
                                            align="stretch"
                                            className="w-full"
                                        >
                                            <div className="grid gap-2">
                                                <Label htmlFor="url">Website URL</Label>
                                                <Input
                                                    id="url"
                                                    type="url"
                                                    name="url"
                                                    autoComplete="url"
                                                    autoFocus
                                                />
                                                <InputError message={errors.url} />
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="default"
                                                size="lg"
                                                className="h-12 w-full rounded-xl text-base shadow-md min-[400px]:w-auto min-[400px]:min-w-56"
                                                disabled={processing}
                                            >
                                                {processing && (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                )}
                                                Start Scan
                                            </Button>
                                        </Stack>
                                    )}
                                </Form>
                            </Stack>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div> */}
        </>
    );
}
