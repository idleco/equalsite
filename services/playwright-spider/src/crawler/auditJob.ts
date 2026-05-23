import { createCrawler } from "../crawler";
import { zipArtifacts } from "../utils/filesystem";
import { activeCrawlers, cancelledCrawls } from '../queue';
import fs from 'node:fs';
import { emitCompleted } from "../crawler/streams";
import type { Job } from "bullmq";
import { AUTH_HEADER } from "./constants";

export type JobPayload = {
    crawlId: string;
    url: string;
    callbackUrl: string;
}

export async function runAuditJob(
    job: Job<{
        crawlId: string;
        url: string;
        callbackUrl: string;
    }>
) {
    const {crawlId, url, callbackUrl } = job.data;

    const crawler = createCrawler(crawlId);

    activeCrawlers.set(crawlId, {
        crawler,
        crawlId,
        startingUrl: url,
        startedAt: new Date(),
    });

    if (cancelledCrawls.has(crawlId)) {
        return;
    }

    try {
        await crawler.run([url]);

        void emitCompleted({ crawlId });

        const zippedArtifactsPath = await zipArtifacts(crawlId);
        await callbackWithArtifacts({
            zippedArtifactsPath,
            crawlId,
            callbackUrl,
        });
    } finally {
        activeCrawlers.delete(crawlId);
        cancelledCrawls.delete(crawlId)
    }
}

async function callbackWithArtifacts({
    crawlId,
    callbackUrl,
    zippedArtifactsPath,
} : {
    crawlId: string;
    callbackUrl: string;
    zippedArtifactsPath: string;
}) {
    const form = new FormData();
    form.append('crawlId', crawlId);
    form.append(
        'artifact',
        new Blob([fs.readFileSync(zippedArtifactsPath)]),
        `${crawlId}.zip`,
    );
    return await fetch(callbackUrl, {
        method: 'POST',
        headers: { ...AUTH_HEADER },
        body: form,
    });
}
