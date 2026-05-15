import { Router } from "express";
import { PlaywrightCrawler, EnqueueStrategy, purgeDefaultStorages } from 'crawlee';
import { AxeBuilder } from '@axe-core/playwright';
import { sanitizeurl } from "../utils";
import {publish} from '../lib/redis';

export function createPlaywrightRouter() {
    const router = Router();

  router.post("/playwright", async (req, res) => {
    const crawler = createPlaywrightCrawler();
    const result = await crawler.run([req.url]);
    res.json({ result });
  });

  return router;
}

function createPlaywrightCrawler() {
    return new PlaywrightCrawler({
        maxRequestsPerCrawl: 10,
        maxRequestsPerMinute: 2,
        maxConcurrency: 2,
        requestHandlerTimeoutSecs: 30,
        launchContext: {
            launchOptions: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                ]
            }
        },
        async requestHandler({ page, request, enqueueLinks, pushData, log }) {
            const sanitizedURL = sanitizeurl(request.url);
            if (!sanitizedURL) {
                log.error('Invalid or No URL provided.', { url: sanitizedURL });
                process.exit(1);
            }

            // stdWriteLn('STARTED', {
            //     url: sanitizedURL
            // });

            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
                .analyze();

            // Per-page summary report
            // stdWriteLn('PAGE_SUMMARY', {
            //     url: sanitizedURL,
            //     totalViolationsCount: results.violations.length
            // });

            publish('laravel_events', {
                event: 'summary',
                payload: {
                    url: sanitizedURL,
                    violations: results.violations.length
                }
            });

            await pushData({
                url: sanitizedURL,
                violations: results.violations
            });

            await enqueueLinks({
                strategy: EnqueueStrategy.SameHostname,
                selector: 'a',
                transformRequestFunction: (req) => {
                    if (req.url.endsWith('.pdf')) return false;
                    return req;
                },
            });

            // Overall-progress metrics
            // stdWriteLn('PROGRESS', crawler.stats.calculate());
        },

        failedRequestHandler({ request }) {
            // stdWriteLn('ERROR', {
            //     url: request.url,
            //     error: request.errorMessages
            // });
            process.exit(1);
        },
    });
}
