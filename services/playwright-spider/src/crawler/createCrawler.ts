import path from 'node:path';
import type { PlaywrightCrawlerOptions} from 'crawlee';
import { Configuration, EnqueueStrategy, PlaywrightCrawler } from 'crawlee';

import { AxeBuilder } from '@axe-core/playwright';
import { setupResourceBlocking } from './resourceBlocking';
import { artifactsDir, crawlerOptions } from '../config/crawlee';

import { emitFailed, emitProgress, emitStarted } from './streams';

export default function createCrawler(
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
        const url = request.url;
        const errors = request.errorMessages;

        log.error('Request failed', {
            crawlId,
            url,
            errors
        });

        await emitFailed({
            crawlId,
            url,
            errors,
        });
    }

    const options: PlaywrightCrawlerOptions = {
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
            const url = request.url;

            await emitStarted({ crawlId, url });

            const axeResults = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
                .analyze();

            await emitProgress({
                url,
                crawlId,
                axeResults
            })

            await pushData({
                crawlId,
                url,
                violations: axeResults.violations
            });

            await enqueueLinks({
                strategy: EnqueueStrategy.SameHostname,
                selector: 'a'
            });
        }
    };

    return new PlaywrightCrawler(options, config);
}
