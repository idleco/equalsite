import { throttleAsync } from "./throttleAsync";
import { publishEvent } from "./publishEvent";

interface PublishAuditProgressOptions {
    crawlId: string;
    pagesCompleted: number;
    pagesTotal: number;
    currentUrl?: string;
    violations: number;
}

const THROTTLE_DELAY = 1000;

export async function publishAuditProgress(
    options: PublishAuditProgressOptions
) {
    const {
        crawlId,
        pagesCompleted,
        pagesTotal,
        currentUrl,
        violations,
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
                    pagesCompleted,
                    pagesTotal,
                    currentUrl,
                    violations,
                    progress
                }
        });
        },
        THROTTLE_DELAY
    )
}
