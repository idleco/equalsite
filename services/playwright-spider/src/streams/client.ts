import { redis } from "../lib/redis";
import type { Client } from "./types";

const VERSION = '1';

const client = ({
    channel,
    version = VERSION
}: {
    channel: string,
    version?: string,
}): Client => ({
    publish: async (event: {
        type: string;
        payload: unknown;
    }) => {
        const data = {
            channel,
            type: event.type,
            payload: event.payload,
            version,
        };

        try {
            const id = await redis.xadd(
                channel,
                '*',
                'data',
                JSON.stringify(data)
            );

            console.log('[Redis] Stream Published', {
                id,
                data: event
            });
        } catch (err) {
            console.error(err);
        }
    }
});

export default client;
