import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { randomUUID } from "node:crypto";
import { activeCrawlers, cancelledCrawls } from "../../queue/activeCrawlers";
import { crawlQueue } from '../../queue/crawlQueue';
import { ensureCallbackUrlReachable } from "./validation";
import path from "node:path";
import { ARTIFACTS_DIRECTORY } from "../../crawler/constants";
import { deleteDirectoryIfExists } from "../../utils/filesystem";
import { publishQueuePositions } from "../../events/publishQueuePositions";

/**
 * Add new audit job to the queue
 */
export const postCrawl: RequestHandler = asyncHandler(async (
    request: Request,
    response: Response
) => {
    const url = request.body.url as string;
    const callbackUrl = request.query.callback as string;

    try {
        await ensureCallbackUrlReachable(callbackUrl);
    } catch {
        return response.status(403).json({
            error: 'The callback url is unreachable.'
        });
    }

    const crawlId = randomUUID();
    const job = await crawlQueue.add(
        'audit',
        {
            crawlId,
            url,
            callbackUrl
        },
        {
            jobId: crawlId
        }
    );

    await publishQueuePositions();

    return response.status(202).json({
        accepted: true,
        crawlId: job.id,
    });
});

/**
 * Show audit job info
 */
export const showCrawlState: RequestHandler = asyncHandler(async (
    request: Request<{ id: string }>,
    response: Response
) => {
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

/**
 * Remove the 'waiting' job to the queue, teardown crawlee instance,
 * and clean-up storage
 */
export const cancelCrawl: RequestHandler = asyncHandler(async (
    request: Request<{ id: string }>,
    response: Response
) => {
    const crawlId = request.params.id;

    // mark as cancelled
    cancelledCrawls.add(crawlId);

    const job = await crawlQueue.getJob(crawlId);

    // remove waiting job
    const state = await job?.getState();
    if (
        state === 'waiting' ||
        state === 'delayed'
    ) {
        await job?.remove();
    }

    const active = activeCrawlers.get(crawlId);

    // Teardown crawler instance
    if (active) {
        try {
            await active.crawler.teardown();
        } catch (error) {
            console.error('Crawler teardown failed', error);
        } finally {
            activeCrawlers.delete(crawlId);
        }
    }

    // Cleanup
    try {
        await deleteDirectoryIfExists(
            path.join(ARTIFACTS_DIRECTORY, crawlId)
        );
    } catch (err) {
        console.error('Crawler cleanup failed', err);
    }

    // publih event

    return response.json({
        cancelled: true,
        crawlId,
        timestamp: new Date().toISOString()
    });
});
