import { asyncHandler } from "../../middleware/asyncHandler";
import { randomUUID } from "node:crypto";
import { activeCrawlers, cancelledCrawls, crawlQueue } from "../../queue";
import { emitCancelled } from "../../crawler/streams";
import { ensureCallbackUrlReachable } from "./validation";
import path from "node:path";
import { ARTIFACTS_DIRECTORY } from "../../crawler/constants";
import { deleteDirectoryIfExists } from "../../utils/filesystem";
export const showCrawlState = asyncHandler(async (request, response) => {
    const crawlId = request.params.id;
    const job = await crawlQueue.getJob(crawlId);
    if (!job) {
        return response.status(404).json({
            error: 'Job not found.'
        });
    }
    const state = await job.getState();
    const waiting = await crawlQueue.getWaiting();
    const position = waiting.findIndex(i => i.id === job.id);
    return response.json({
        crawlId,
        state,
        position,
        waiting: waiting.length,
        progress: job.progress
    });
});
export const cancelCrawl = asyncHandler(async (request, response) => {
    const crawlId = request.params.id;
    // mark as cancelled
    cancelledCrawls.add(crawlId);
    const job = await crawlQueue.getJob(crawlId);
    // remove waiting job
    const state = await job?.getState();
    if (state === 'waiting' ||
        state === 'delayed') {
        await job?.remove();
    }
    const active = activeCrawlers.get(crawlId);
    // Teardown crawler instance
    if (active) {
        try {
            await active.crawler.teardown();
        }
        catch (error) {
            console.error('Crawler teardown failed', error);
        }
        finally {
            activeCrawlers.delete(crawlId);
        }
    }
    // Cleanup
    try {
        await deleteDirectoryIfExists(path.join(ARTIFACTS_DIRECTORY, crawlId));
    }
    catch (err) {
        console.error('Crawler cleanup failed', err);
    }
    // Publish event
    await emitCancelled({ crawlId });
    return response.json({
        cancelled: true,
        crawlId,
        timestamp: new Date().toISOString()
    });
});
export const postCrawl = asyncHandler(async (request, response) => {
    const url = request.body.url;
    const callbackUrl = request.query.callback;
    try {
        await ensureCallbackUrlReachable(callbackUrl);
    }
    catch {
        return response.status(403).json({
            error: 'The callback url is unreachable.'
        });
    }
    const crawlId = randomUUID();
    const job = await crawlQueue.add('audit', { crawlId, url, callbackUrl }, { jobId: crawlId });
    return response.status(202).json({
        crawlId: job.id,
        status: 'queued',
        timestamp: (new Date()).toISOString(),
    });
});
//# sourceMappingURL=crawlerHandlers.js.map