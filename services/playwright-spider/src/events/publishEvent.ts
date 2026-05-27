import { redis } from "../lib/redis";
import type {
    CancelledPayload,
    CompletedPayload,
    EventType,
    FailedPayload,
    ProgressPayload,
    QueuedPayload,
    StartedPayload,
    TelemetryPayload
} from "@equalsite/types";

const STREAM_NAME = String(process.env.STREAM_NAME);
const VERSION = '1';

interface EventMap {
    'audit.queued': QueuedPayload;
    'audit.progress': ProgressPayload;
    'audit.started': StartedPayload;
    'audit.completed': CompletedPayload;
    'audit.failed': FailedPayload;
    'audit.cancelled': CancelledPayload;
    'crawler.telemetry': TelemetryPayload;
};

type EventPayload<T extends EventType> = EventMap[T];

export async function publishEvent<T extends EventType>(event: {
    type: T;
    payload: EventPayload<T>;
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
    console.log('[Redis Stream] published event: ', JSON.stringify({
        version: VERSION,
        timestamp: Date.now(),
        ...event,
    }));
}
