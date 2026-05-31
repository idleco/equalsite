import { streamClient } from "../services/redis";
import type { EventPublisher } from "../../audit/repositories/eventPublisher";

const VERSION = '1';
const STREAM_NAME = String(process.env.STREAM_NAME);

export const publishEvent: EventPublisher = async function(event) {
    await streamClient.xadd(
        STREAM_NAME,
        'MAXLEN',
        '~',
        '10000',
        '*',
        'data',
        JSON.stringify({
            version: VERSION,
            timestamp: Date.now(),
            ...event
        })
    );
    console.log('[Redis Stream] published event: ', JSON.stringify({
        version: VERSION,
        timestamp: Date.now(),
        ...event,
    }));
}
