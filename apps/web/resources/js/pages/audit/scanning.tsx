import { Head, Link, router } from '@inertiajs/react';
import ScanTimeline from '@/components/scanning/scan-timeline';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { ProgressState, QueueStatus, ServerityBreakdown } from '@equalsite/types';
import ScanDetails from '@/components/scanning/scan-details';
import type { Audit } from '@/components/scanning/types';
import ScanOverview from '@/components/scanning/scan-overview';
import ProcessedUrls from '@/components/scanning/processed-urls';
import { useEchoPublic } from '@laravel/echo-react';

type Props = {
    audit: Audit;
    progress: ProgressState;
    queueStatus: QueueStatus
    processedUrls: Record<string, ServerityBreakdown>;
}

function Breadcrumbs({
    audit
}: {
    audit: Audit
}) {
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
                    <BreadcrumbPage>{audit.id}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default function Scanning({
    audit,
    processedUrls,
    progress,
    queueStatus
}: Props) {
    useEchoPublic(
        `audit-${audit.crawlId}`,
        '.audit.ws-event',
        (e) => {
            console.log('Echo', e);
            router.reload({
                only: ['audit', 'processedUrls', 'progress', 'queueStatus']
            });
        }
    );
    return (
        <>
            <Head title="Welcome" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumbs audit={audit} />
                <ScanDetails audit={audit} queueStatus={queueStatus} />
                <ScanOverview progress={progress} />
                <ProcessedUrls processedUrls={processedUrls} />
                <ScanTimeline />
            </div>
        </>
    );
}
