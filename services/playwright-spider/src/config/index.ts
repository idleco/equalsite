import path from 'node:path';

export const secretKey = String(process.env.CRAWLER_SECRET);

export const redis = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
}

export const bullmq = {
    queue: 'crawl-queue',
    concurrency: 2
}

const storagePath = path.join(process.cwd(), 'storage');
export const crawler = {
    maxRequestsPerCrawl: Number(process.env.CRAWLER_PAGE_LIMIT || 50),
    artifactDirectory: path.join(storagePath, 'artifacts'),
    archiveDirectory: path.join(storagePath, 'archives')
}
