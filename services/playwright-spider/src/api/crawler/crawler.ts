import path from 'node:path';
import type { PlaywrightCrawlerOptions} from 'crawlee';
import { Configuration, EnqueueStrategy, PlaywrightCrawler } from 'crawlee';
import { AxeBuilder } from '@axe-core/playwright';
import { setupResourceBlocking } from './resourceBlocking';
import { publish } from '../../utils/redis';
import { artifactsDir, crawlerOptions } from '../../config/crawlee';

export interface ActiveCrawler {
    crawler: PlaywrightCrawler;
    startedAt: Date;
}

export const activeCrawlers = new Map<string, ActiveCrawler>();

export function createCrawler(
    uniqueId: string
): PlaywrightCrawler {
    const options: PlaywrightCrawlerOptions = {
        ...crawlerOptions,

        /** Block resources */
        preNavigationHooks: [
            setupResourceBlocking()
        ],

        /** Failure handling */
        failedRequestHandler: async ({
            request,
            log
        }) => {
            log.error('Request failed', {
                uniqueId,
                url: request.url,
                errors: request.errorMessages
            });

            // emit stream event
            await publish('laravel_events', {
                type: "Error",
                payload: request.errorMessages
            });
        },

        /** Main handler */
        async requestHandler({
            page,
            request,
            enqueueLinks,
            pushData,
            log,
            browserController
        }) {
            log.info('Active pages', {
                activePages: browserController.activePages,
                totalPages: browserController.totalPages,
            });
            const axeResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
                .analyze();

            // emit stream event

            await publish('laravel_events', {
                type: 'PROGRESS',
                payload: {
                    uniqueId,
                    url: request.url,
                    violationsCount: axeResults.violations.length
                }
            });

            await pushData({
                uniqueId,
                url: request.url,
                violations: axeResults.violations
            });

            await enqueueLinks({
                strategy: EnqueueStrategy.SameHostname,
                selector: 'a'
            });
        }
    };

    const storageDir = path.join(
        artifactsDir,
        String(uniqueId),
    );

    const config = new Configuration({
        purgeOnStart: false,
        storageClientOptions: {
            localDataDirectory: storageDir
        },
    });

    return new PlaywrightCrawler(options, config);
}
