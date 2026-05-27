import os from 'node:os';
import process from 'node:process';
import { publishEvent } from "./publishEvent";
import { throttleAsync } from "./throttleAsync";
import { activeCrawlers } from '../queue/activeCrawlers';
import { crawlQueue } from '../queue/crawlQueue';

const THROTTLE_DELAY = 5000;

export async function publishTelemetry() {
    await throttleAsync(
        'crawler-telemetry',
        async () => {
            const memory = process.memoryUsage();
            await publishEvent({
                type: 'crawler.telemetry',
                payload: {
                    process: {
                        pid: process.pid,
                        uptime: process.uptime(),
                        memory: {
                            rss: memory.rss,
                            heapUsed: memory.heapUsed,
                            heapTotal: memory.heapTotal,
                        }
                    },
                    system: {
                        loadAverage: os.loadavg(),
                        freeMemory: os.freemem(),
                        totalMemory: os.totalmem(),
                    },
                    queue: {
                        waiting: await crawlQueue.getWaitingCount(),
                        active: await crawlQueue.getActiveCount(),
                    },
                    crawlers: {
                        active: activeCrawlers.size,
                    },
                }
            })
        },
        THROTTLE_DELAY
    );
}
