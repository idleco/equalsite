import { Head, Link } from '@inertiajs/react';
import ScanTimeline from '@/components/scanning/scan-timeline';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import type { Stats } from '@equalsite/types';
import ScanDetails from '@/components/scanning/scan-details';
import type { Audit, ProcessedUrl } from '@/components/scanning/types';
import ProcessedUrls from '@/components/scanning/processed-urls';
import ScanOverview from '@/components/scanning/scan-overview';
import { ScanningContextProvider, useScanningContext } from '@/components/scanning/scanning-context';

type Props = {
    audit: Audit;
    stats: Stats;
    processedUrls: ProcessedUrl[];
}

function Breadcrumbs() {
    const {audit} = useScanningContext();
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
                    <BreadcrumbPage>{audit.details.id}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default function Scanning({
    audit,
    processedUrls,
    stats
}: Props) {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <ScanningContextProvider {...{
                    audit,
                    stats,
                    processedUrls
                }}>
                    <Breadcrumbs />
                    <ScanDetails />
                    <ScanOverview />
                    <ProcessedUrls />
                    <ScanTimeline />
                </ScanningContextProvider>
            </div>
        </>
    );
}
