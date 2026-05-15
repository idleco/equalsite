import { PlaywrightCrawler, EnqueueStrategy, purgeDefaultStorages } from 'crawlee';
import { AxeBuilder } from '@axe-core/playwright';
import Redis from 'ioredis'

const publisher = new Redis({
    host: 'redis',
    db: 0,
});

function sendMessage(channel, message) {
    publisher.publish(`laravel-database-${channel}`, JSON.stringify(message));
    console.log(`Published to ${channel}:`, message);
}

function stdWriteLn(type, payload) {
    process.stdout.write(JSON.stringify({ type, payload }) + '\n');
}

function sanitizeurl(urlString) {
    try {
        const url = new URL(urlString);
        url.hash = ''; // Remove #anchors
        let normalized = url.href.replace(/\/$/, ""); // Remove trailing slash
        return normalized;
    } catch {
        return null;
    }
}


(async () => {
    await purgeDefaultStorages();

    const crawler = new PlaywrightCrawler({
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

            stdWriteLn('STARTED', {
                url: sanitizedURL
            });

            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
                .analyze();

            // Per-page summary report
            stdWriteLn('PAGE_SUMMARY', {
                url: sanitizedURL,
                totalViolationsCount: results.violations.length
            });

            sendMessage('laravel_events', {
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
            stdWriteLn('PROGRESS', crawler.stats.calculate());
        },

        failedRequestHandler({ request }) {
            stdWriteLn('ERROR', {
                url: request.url,
                error: request.errorMessages
            });
            process.exit(1);
        },
    });

    const url = process.argv[2];

    await crawler.run([url]);
    stdWriteLn('DONE', { message: 'Successful!' });
})();

