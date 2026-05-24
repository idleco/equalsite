import Publisher from './publisher';
import Client from './client';
import activeJobs from '../queue/activeJobs';
const client = Client({
    channel: String(process.env.CRAWLER_CHANNEL)
});
export const publisher = Publisher(client);
export async function emitStarted({ crawlId, url }) {
    const active = activeJobs.get(crawlId);
    if (active && url === active.startingUrl) {
        await publisher.publish('started', {
            url,
            crawlId,
            timestamp: (new Date()).toISOString()
        });
    }
}
export async function emitCancelled({ crawlId }) {
    const stats = await getStats(crawlId);
    await publisher.publish('cancelled', {
        crawlId,
        stats,
        timestamp: (new Date()).toISOString()
    });
}
;
export async function emitCompleted({ crawlId, }) {
    const stats = await getStats(crawlId);
    await publisher.publish('completed', {
        crawlId,
        stats,
        timestamp: (new Date()).toISOString()
    });
}
export async function emitFailed({ crawlId, url, errors, }) {
    const stats = await getStats(crawlId);
    await publisher.publish('failed', {
        crawlId,
        url,
        errors,
        stats,
        timestamp: (new Date()).toISOString(),
    });
}
export async function emitProgress({ crawlId, url, axeResults }) {
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
async function getStats(crawlId) {
    const activeJob = activeJobs.get(crawlId);
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
    };
}
//# sourceMappingURL=index.js.map