import path from 'node:path';
import type { PlaywrightCrawlerOptions} from 'crawlee';
import { Configuration, EnqueueStrategy, PlaywrightCrawler } from 'crawlee';

import { AxeBuilder } from '@axe-core/playwright';
import { setupResourceBlocking } from './resourceBlocking';
import { stream } from '../../utils/redis';
import { artifactsDir, crawlerOptions, redisStreamChannel } from '../../config/crawlee';

// @ts-ignore todo
import type { AxeResults } from 'axe-core';

export interface ActiveCrawler {
    crawler: PlaywrightCrawler;
    startingUrl: string;
    startedAt: Date;
}

export const activeCrawlers = new Map<string, ActiveCrawler>();

const streamer = stream(redisStreamChannel);

export async function reportCompleted({
    uniqueId,
} : {
    uniqueId: string;
}) {
    await streamer('completed', {
        crawlId: uniqueId,
        timetamp: (new Date()).toISOString()
    });
}

export async function reportStarted({
    crawlId,
    url
} : {
    crawlId: string;
    url: string
}) {
    const active = activeCrawlers.get(crawlId);
    if (active && url === active.startingUrl) {
        await streamer('started', {
            crawlId,
            timestamp: (new Date()).toISOString()
        })
    }
}

export async function reportProgress({
    crawler,
    crawlId,
    url,
    axeResults
} : {
    crawler: PlaywrightCrawler;
    crawlId: string;
    url: string;
    axeResults: AxeResults;
}) {
    const requestQueue = await crawler.getRequestQueue();
            const info = await requestQueue.getInfo();

    await streamer('progress', {
        crawlId,
        url,
        violations: axeResults.violations.length,
        stats: {
            totalRequests: info?.totalRequestCount,
            pendingRequests: info?.pendingRequestCount,
            processedRequests: info?.handledRequestCount,
            failedRequests: crawler.stats.state.requestsFailed,
            concurrency: crawler.autoscaledPool?.currentConcurrency
        }
    });
}

export function createCrawler(
    crawlId: string
): PlaywrightCrawler {
    const storageDir = path.join(
        artifactsDir,
        String(crawlId),
    );

    const config = new Configuration({
        purgeOnStart: false,
        storageClientOptions: {
            localDataDirectory: storageDir
        },
    });

    const failedRequestHandler: PlaywrightCrawlerOptions['failedRequestHandler'] = async ({
        request,
        log
    }) => {
        log.error('Request failed', {
            crawlId,
            url: request.url,
            errors: request.errorMessages
        });

        await streamer('failed', {
            crawlId,
            url: request.url,
            errors: request.errorMessages,
        });
    }

    const crawler = new PlaywrightCrawler({
        ...crawlerOptions,
        preNavigationHooks: [
            setupResourceBlocking()
        ],
        failedRequestHandler,

        /** Main handler */
        async requestHandler({
            page,
            request,
            enqueueLinks,
            pushData,
        }) {
            await reportStarted({
                crawlId,
                url: request.url
            });

            const axeResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
                .analyze();

            await reportProgress({
                url: request.url,
                crawler,
                crawlId,
                axeResults
            })

            await pushData({
                crawlId,
                url: request.url,
                violations: axeResults.violations
            });

            await enqueueLinks({
                strategy: EnqueueStrategy.SameHostname,
                selector: 'a'
            });
        }
    }, config);

    return crawler;
}
