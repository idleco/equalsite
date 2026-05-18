import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { randomUUID } from "node:crypto";
import { activeCrawlers, createCrawler } from "./crawler";
import type { PlaywrightCrawler } from "crawlee";
import fs from 'node:fs';
import { zipArtifacts } from "../../utils/filesystem";
import { authorizationHeader } from "../../config/http";
import { safeCallbackUrlIsAlive } from "../../utils/http";

export const cancelCrawl: RequestHandler = asyncHandler(async (
    request: Request,
    response: Response
) => {
    const id = request.params.id as string;

    const active = activeCrawlers.get(id);

    if (!active) {
        return response.status(404).json({
            error: 'Crawler not found',
        });
    }

    await active.crawler.teardown();

    activeCrawlers.delete(id);

    return response.json({
        cancelled: true
    });
});

export const postCrawl: RequestHandler = asyncHandler(async (
    request: Request,
    response: Response
) => {
    const url = request.body.url as string;
    const callback = request.query.callback as string;

    if (! await safeCallbackUrlIsAlive(callback)) {
        return response.status(403).json({
            error: 'The callback url is unreachable.'
        });
    }

    const uniqueId = randomUUID();
    const crawler = createCrawler(uniqueId);

    void runCrawler(crawler, {
        id: uniqueId,
        url,
        callbackUrl: callback
    })

    return response.status(202).json({
        crawlId: uniqueId,
        status: 'queued',
        timestamp: (new Date()).toISOString(),
    });
});


async function runCrawler(
    crawler: PlaywrightCrawler,
    payload: { id: string; url: string, callbackUrl: string }
) {
    activeCrawlers.set(payload.id, {
        crawler,
        startingUrl: payload.url,
        startedAt: new Date(),
    });

    try {
        await crawler.run([payload.url]);

        // handle completion
        void sendAuditArtifact({
            uniqueId: payload.id,
            callbackUrl: payload.callbackUrl
        });
    } finally {
        activeCrawlers.delete(payload.id);
    }
}

async function sendAuditArtifact({
    uniqueId,
    callbackUrl
}:{
    uniqueId: string;
    callbackUrl: string
}) {
    const zipPath = await zipArtifacts(uniqueId);

    const form = new FormData();
    form.append('uniqueId', uniqueId);
    form.append(
        'artifact',
        new Blob([fs.readFileSync(zipPath)]),
        `${uniqueId}.zip`,
    );


    const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: { ...authorizationHeader },
        body: form,
    });

    if (!response.ok) {
        throw new Error(`Artifact upload failed: ${response.status}`);
    }

    /** Clean up! */
    // await fs.promises.rm(
    //     zipPath,
    //     {
    //         force: true,
    //     },
    // );
}
