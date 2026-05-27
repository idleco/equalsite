import { throttleAsync } from "./throttleAsync";
import { publishEvent } from "./publishEvent";
import type { ServerityBreakdown } from "@equalsite/types";

interface PublishAuditProgressOptions {
    crawlId: string;
    pagesPending: number;
    pagesCompleted: number;
    pagesTotal: number;
    currentUrl?: string;
    violations: number;
    severityBreakdown: ServerityBreakdown;
}

const THROTTLE_DELAY = 1000;

export async function publishAuditProgress(
    options: PublishAuditProgressOptions
) {
    const {
        crawlId,
        pagesPending,
        pagesCompleted,
        pagesTotal,
        currentUrl,
        violations,
        severityBreakdown,
    } = options;
    await throttleAsync(
        `audit-progress:${crawlId}`,
        async () => {
            const progress =
                pagesTotal === 0
                    ? 0
                    : Math.round(
                        (pagesCompleted / pagesTotal) * 100
                    );
            await publishEvent({
                type: 'audit.progress',
                payload: {
                    crawlId,
                    completedRequests: pagesCompleted,
                    pendingRequests: pagesPending,
                    totalRequests: pagesTotal,
                    currentUrl,
                    violations,
                    progressPercentage: progress,
                    severityBreakdown
                }
        });
        },
        THROTTLE_DELAY
    )
}
