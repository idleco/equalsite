import type { PlaywrightCrawlerOptions } from "crawlee";
import path from "node:path"

const storageDir = path.join(process.cwd(), 'storage');

export const artifactsDir = path.join(storageDir, 'artifacts');

export const archivesDir = path.join(storageDir, 'archives');

export const crawlerOptions: PlaywrightCrawlerOptions = {
    /** Concurrency */
    minConcurrency: 1,
    maxConcurrency: 2,
    maxRequestsPerCrawl: 5,

    /** Retry behavior */
    maxRequestRetries: 2,
    requestHandlerTimeoutSecs: 120,
    navigationTimeoutSecs: 45,

    /** Browser */
    headless: true,

    /** Session management */
    useSessionPool: true,
    persistCookiesPerSession: false,

    /** Resource control */
    autoscaledPoolOptions: {
        desiredConcurrency: 2,
        maxConcurrency: 2,
        autoscaleIntervalSecs: 10,
        maybeRunIntervalSecs: 1,
        loggingIntervalSecs: 30,
        taskTimeoutSecs: 180,
        snapshotterOptions: {
            maxUsedMemoryRatio: 0.75
        }
    },

    /** Browser launch */
    launchContext: {
        launchOptions: {
            args: [
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        },
    },
}
