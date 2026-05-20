import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { randomUUID } from "node:crypto";
import activeJobs from "../../queue/activeJobs";
import { urlIsReachable, withAuthorization } from "../../utils/http";
import { crawlQueue } from "../../queue/crawlQueue";
import { runCrawlJob } from "../../queue/crawlWorker";

export const cancelCrawl: RequestHandler = asyncHandler(async (
    request: Request,
    response: Response
) => {
    const id = request.params.id as string;

    const active = activeJobs.get(id);
    if (!active) {
        return response.status(404).json({
            error: 'Crawler not found',
        });
    }

    try {
        await active.crawler.teardown();
    } finally {
        activeJobs.delete(id);
    }

    return response.json({
        cancelled: true
    });
});

export const postCrawl: RequestHandler = asyncHandler(async (
    request: Request,
    response: Response
) => {
    const url = request.body.url as string;
    const callbackUrl = request.query.callback as string;

    if (! await urlIsReachable(callbackUrl, { headers: withAuthorization() })) {
        return response.status(403).json({
            error: 'The callback url is unreachable.'
        });
    }

    const crawlId = randomUUID();

    void crawlQueue.add(async () => {
        await runCrawlJob({
            crawlId,
            url,
            callbackUrl
        })
    });

    return response.status(202).json({
        crawlId,
        status: 'queued',
        timestamp: (new Date()).toISOString(),
    });
});
