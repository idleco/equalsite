import path from 'node:path';
import type { PlaywrightCrawlerOptions } from 'crawlee';
import { Configuration, EnqueueStrategy, PlaywrightCrawler } from 'crawlee';

import { AxeBuilder } from '@axe-core/playwright';
import { setupResourceBlocking } from './resourceBlocking';
import { ARTIFACTS_DIRECTORY } from './constants';

import { publishAuditProgress } from '../events/publishAuditProgress';
import type { ServerityBreakdown } from '@equalsite/types';

export default function createCrawler(crawlId: string): PlaywrightCrawler {
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

    const requestHandler: PlaywrightCrawlerOptions['requestHandler'] = async ({
        request,
        page,
        pushData,
        crawler,
        enqueueLinks,
    }) => {
        const currentUrl = request.url;

        const axeResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();

        const severityBreakdown = axeResults.violations
            .reduce<ServerityBreakdown>(
                (prev, curr) => {
                    if (curr.impact) {
                        prev[curr.impact] = prev[curr.impact] + 1;
                    }
                    return prev;
                },
                {
                    critical: 0,
                    serious: 0,
                    moderate: 0,
                    minor: 0
                }
            );

        await pushData({
            crawlId,
            url: currentUrl,
            violations: axeResults.violations
        });

        const requestQueue = await crawler.getRequestQueue();
        await enqueueLinks({
            requestQueue,
            strategy: EnqueueStrategy.SameDomain,
            selector: 'a',
        });

        const info = await requestQueue.getInfo();
        await publishAuditProgress({
            crawlId,
            severityBreakdown,
            currentUrl,
            pagesTotal: info?.totalRequestCount || 0,
            pagesPending: info?.pendingRequestCount || 0,
            pagesCompleted: info?.handledRequestCount || 0,
            violations: axeResults.violations.length,
        })
    }

    return new PlaywrightCrawler(
        {
            requestHandler,
            minConcurrency: 1,
            maxConcurrency: 2,
            maxRequestsPerCrawl: 50,
            maxRequestRetries: 2,
            requestHandlerTimeoutSecs: 120,
            navigationTimeoutSecs: 45,
            headless: true,
            useSessionPool: true,
            persistCookiesPerSession: false,
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
            preNavigationHooks: [
                setupResourceBlocking()
            ],
        },
        config
    );
}
