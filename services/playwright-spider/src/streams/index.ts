import Publisher from './publisher';
import Client from './client';
import type { AxeResults } from 'axe-core';
import activeJobs from '../queue/activeJobs'
import type { Stats } from './types';

const client = Client({
    channel: String(process.env.CRAWLER_CHANNEL)
});

export const publisher = Publisher(client);

export async function emitStarted({
    crawlId,
    url
} : {
    crawlId: string;
    url: string
}) {
    const active = activeJobs.get(crawlId);
    if (active && url === active.startingUrl) {
        await publisher.publish('started', {
            url,
            crawlId,
            timestamp: (new Date()).toISOString()
        })
    }
}

export async function emitCancelled({
    crawlId
} : {
    crawlId: string;
}) {
    const stats = await getStats(crawlId);
    await publisher.publish('cancelled', {
        crawlId,
        stats,
        timestamp: (new Date()).toISOString()
    });
};

export async function emitCompleted({
    crawlId,
} : {
    crawlId: string;
}) {
    const stats = await getStats(crawlId);
    await publisher.publish('completed', {
        crawlId,
        stats,
        timestamp: (new Date()).toISOString()
    });
}

export async function emitFailed({
    crawlId,
    url,
    errors,
} : {
    crawlId: string;
    url: string;
    errors: string[];
}) {
    const stats = await getStats(crawlId);
    await publisher.publish('failed', {
        crawlId,
        url,
        errors,
        stats,
        timestamp: (new Date()).toISOString(),
    });
}

export async function emitProgress({
    crawlId,
    url,
    axeResults
} : {
    crawlId: string;
    url: string;
    axeResults: AxeResults;
}) {
    const stats = await getStats(crawlId);
    const violations = axeResults.violations;
    await publisher.publish('progress', {
        crawlId,
        url,
        stats,
        violations: violations.length,
        timestamp: (new Date()).toISOString(),
        severityBreakdown: {
            critical: violations.filter(i => i.impact === 'critical').length,
            serious: violations.filter(i => i.impact === 'serious').length,
            moderate: violations.filter(i => i.impact === 'moderate').length,
            minor: violations.filter(i => i.impact === 'minor').length,
        },
    });
}

async function getStats(
    crawlId: string
) : Promise<Stats> {
    const activeJob = activeJobs.get(crawlId)

    const requestQueue = await activeJob?.crawler.getRequestQueue();
    const info = await requestQueue?.getInfo();

    const totalRequests = info?.totalRequestCount || 0;
    const pendingRequests = info?.pendingRequestCount || 0;
    const processedRequests = info?.handledRequestCount || 0;
    const failedRequests = activeJob?.crawler?.stats.state.requestsFailed || 0;
    const concurrency = activeJob?.crawler.autoscaledPool?.currentConcurrency || 0;

    return {
        totalRequests,
        pendingRequests,
        processedRequests,
        failedRequests,
        concurrency
    }
}
