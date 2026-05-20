import PQueue from 'p-queue';

export const crawlQueue = new PQueue({
    concurrency: 2,
});
