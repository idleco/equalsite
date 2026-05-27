import path from 'node:path';
import type { PlaywrightCrawlerOptions} from 'crawlee';
import { Configuration, EnqueueStrategy, PlaywrightCrawler } from 'crawlee';

import { AxeBuilder } from '@axe-core/playwright';
import { setupResourceBlocking } from './resourceBlocking';
import { ARTIFACTS_DIRECTORY } from './constants';

import { publishAuditProgress } from '../events/publishAuditProgress';

export const crawlerOptions: PlaywrightCrawlerOptions = {
    /** Concurrency */
    minConcurrency: 1,
    maxConcurrency: 2,
    maxRequestsPerCrawl: 10,

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

export default function createCrawler(
    crawlId: string
): PlaywrightCrawler {
    const storageDir = path.join(
        ARTIFACTS_DIRECTORY,
        String(crawlId),
    );

    const config = new Configuration({
        purgeOnStart: false,
        storageClientOptions: {
            localDataDirectory: storageDir
        },
    });

    // const failedRequestHandler: PlaywrightCrawlerOptions['failedRequestHandler'] = async ({
    //     request,
    //     log
    // }) => {
    //     const url = request.url;
    //     const errors = request.errorMessages;

    //     log.error('Request failed', {
    //         crawlId,
    //         url,
    //         errors
    //     });

    //     await emitFailed({
    //         crawlId,
    //         url,
    //         errors,
    //     });
    // }

    const options: PlaywrightCrawlerOptions = {
        ...crawlerOptions,

        preNavigationHooks: [
            setupResourceBlocking()
        ],

        // failedRequestHandler,

        /** Main handler */
        async requestHandler({
            page,
            request,
            enqueueLinks,
            pushData,
            crawler
        }) {
            const url = request.url;

            const axeResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
                .analyze();

            await pushData({
                crawlId,
                url,
                violations: axeResults.violations
            });

            await enqueueLinks({
                strategy: EnqueueStrategy.SameHostname,
                selector: 'a'
            });

            const requestQueue = await crawler.getRequestQueue();
            const requestQueueInfo = await requestQueue.getInfo();
            await publishAuditProgress({
                crawlId,
                currentUrl: url,
                pagesTotal: requestQueueInfo?.totalRequestCount || 0,
                pagesCompleted: requestQueueInfo?.handledRequestCount || 0,
                violations: axeResults.violations.length
            })
        }
    };

    return new PlaywrightCrawler(options, config);
}
