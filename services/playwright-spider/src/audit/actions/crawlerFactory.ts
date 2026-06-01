import path from 'node:path';
import type { PlaywrightCrawlerOptions } from 'crawlee';
import { Configuration, EnqueueStrategy, PlaywrightCrawler } from 'crawlee';

import { AxeBuilder } from '@axe-core/playwright';
import type { EventPublisher } from '../repositories/eventPublisher';
import { createProcessAxeResultAction } from './processAxeResult';
import { pageFailedEvent } from '../events/pageFailedEvent';
import { pageStartedEvent } from '../events/pageStartedEvent';

type CrawlerFactoryParams = {
    auditId: string;
    eventPublisher: EventPublisher;
    artifactDirectory: string;
    options: {
        maxPages: number
    }
}

export default function createPlaywrightCrawler({
    auditId,
    eventPublisher,
    artifactDirectory,
    options
}: CrawlerFactoryParams): PlaywrightCrawler {
    const storageDir = path.join(artifactDirectory, String(auditId));
    const config = new Configuration({
        purgeOnStart: false,
        storageClientOptions: {
            localDataDirectory: storageDir
        },
    });

    const failedRequestHandler: PlaywrightCrawlerOptions['failedRequestHandler'] = async ({ request }, error) => {
        await eventPublisher(pageFailedEvent({
            auditId,
            pageUrl: request.url,
            attemptsCount: request.retryCount,
            errorMessage: error.message
        }));
    }

    const requestHandler: PlaywrightCrawlerOptions['requestHandler'] = async ({
        request,
        page,
        pushData,
        enqueueLinks,
    }) => {
        const processAxeResultAction = createProcessAxeResultAction(pushData, eventPublisher);
        console.log('Crawlee page started', {
            auditId,
            pageUrl: request.url,
            attemptsCount: request.retryCount
        });
        await eventPublisher(pageStartedEvent({
            auditId,
            pageUrl: request.url,
            attemptsCount: request.retryCount
        }));

        const axeResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
            .analyze();

        await processAxeResultAction.run({
            pageUrl: request.url,
            auditId,
            axeResults
        })

        await enqueueLinks({
            strategy: EnqueueStrategy.SameDomain,
            selector: 'a',
        });
    }

    return new PlaywrightCrawler(
        {
            failedRequestHandler,
            requestHandler,
            minConcurrency: 1,
            maxConcurrency: 2,
            maxRequestsPerCrawl: options.maxPages,
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
                // Resource Blocking
                async ({ page }) => {
                    await page.route('**/*', async (route) => {
                        const request = route.request();
                        const resourceType = request.resourceType();
                        if ([
                            'media',
                            'font',
                            'websocket',
                            'manifest',
                            'stylesheet',
                        ].includes(resourceType)) {
                            return await route.abort();
                        }

                        const url = request.url();
                        if (
                            url.includes('google-analytics') ||
                            url.includes('doubleclick') ||
                            url.includes('hotjar')
                        ) {
                            return await route.abort();
                        }

                        return await route.continue();
                    });
                }
            ],
        },
        config
    );
}
