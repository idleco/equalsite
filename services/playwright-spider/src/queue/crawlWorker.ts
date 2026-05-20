import { createCrawler } from "../crawler";
import { zipArtifacts } from "../utils/filesystem";
import activeJobs from './activeJobs'
import { withAuthorization } from "../utils/http";
import fs from 'node:fs';
import { emitCompleted } from "../crawler/streams";

type JobPayload = {
    crawlId: string;
    url: string;
    callbackUrl: string;
}

export async function runCrawlJob(job: JobPayload) {
    const crawler = createCrawler(job.crawlId);

    activeJobs.set(job.crawlId, {
        crawler,
        startingUrl: job.url,
        startedAt: new Date(),
    });

    try {
        await crawler.run([job.url]);

        void emitCompleted({ crawlId: job.crawlId });

        const zippedArtifactsPath = await zipArtifacts(job.crawlId);

        await callbackWithArtifacts({
            zippedArtifactsPath,
            crawlId: job.crawlId,
            callbackUrl: job.callbackUrl,
        });
    } finally {
        activeJobs.delete(job.crawlId);
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
        headers: withAuthorization(),
        body: form,
    });
}
