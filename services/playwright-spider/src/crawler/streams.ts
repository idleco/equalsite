import { stream } from "../utils/redis";
import jobs from '../queue/activeJobs'

// @ts-ignore todo
import type { AxeResults } from 'axe-core';
import activeJobs from "../queue/activeJobs";

const streamer = stream(process.env.CRAWLER_CHANNEL || 'crawler.streams');

export async function emitCompleted({
    crawlId,
} : {
    crawlId: string;
}) {
    const stats = await getStats(crawlId);
    await streamer('completed', {
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
    await streamer('failed', {
        crawlId,
        url,
        errors,
        stats,
        timestamp: (new Date()).toISOString(),
    });
}

export async function emitStarted({
    crawlId,
    url
} : {
    crawlId: string;
    url: string
}) {
    const active = jobs.get(crawlId);
    if (active && url === active.startingUrl) {
        await streamer('started', {
            crawlId,
            timestamp: (new Date()).toISOString()
        })
    }
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
    await streamer('progress', {
        crawlId,
        url,
        timestamp: (new Date()).toISOString(),
        violations: axeResults.violations.length,
        stats
    });
}

async function getStats(
    crawlId: string
) : Promise<{
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}> {
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
