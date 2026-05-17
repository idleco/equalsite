import Redis from "ioredis"
import config from '../config/redis';

const redis = new Redis({
    host: config.redisHost,
    port: config.redisPort,
});

export async function publish(channel: string, message: any) {
    try {
        const channelName = `${config.redisPrefix}${channel}`;
        await redis.publish(
            channelName,
            JSON.stringify(message)
        );
        console.log(`Published to ${channelName}:`, message);
    } catch (error) {
        console.error(error);
    }
}
