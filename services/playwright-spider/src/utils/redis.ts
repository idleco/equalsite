import Redis from "ioredis"
import config from '../config/redis';

const redis = new Redis({
    host: config.redisHost,
    port: config.redisPort,
});

const VERSION = 1;


export const stream = (channel: string) =>
    async (type: string, payload: unknown) => {
        const event = {
            channel,
            type,
            payload,
            version: VERSION,
        };
        try {
            const id = await redis.xadd(
                channel,
                '*',
                'data',
                JSON.stringify(event)
            );

            console.log('Redis stream event: ', {
                eventId: id,
                data: event
            });
        } catch (err) {
            console.error(err);
        }
    }

export const publish = (channel: string) =>
    async (type: string, payload: unknown) => {
        const message = {
            channel: `${config.redisPrefix}${channel}`,
            payload: {
                type,
                version: VERSION,
                payload
            }
        };
        try {
            const id = await redis.publish(
                message.channel,
                JSON.stringify(payload)
            );

            console.log('Redis publish message: ', {
                messageId: id,
                ...message
            });
        } catch (err) {
            console.error(err);
        }
    }
