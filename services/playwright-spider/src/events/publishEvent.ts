import { redis } from "../lib/redis";

type EventType =
    | 'audit.queued'
    | 'audit.started'
    | 'audit.progress'
    | 'audit.completed'
    | 'audit.failed'
    | 'audit.cancelled'
    | 'crawler.telemetry';

const STREAM_NAME = String(process.env.STREAM_NAME);
const VERSION = '1';

export async function publishEvent(event: {
    type: EventType;
    payload: unknown;
}) {
    await redis.xadd(
        STREAM_NAME,
        'MAXLEN',
        '~',
        '10000',
        '*',
        'data',
        JSON.stringify({
            version: VERSION,
            timestamp: Date.now(),
            ...event,
        })
    );
}
