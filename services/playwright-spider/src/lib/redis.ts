import Redis from "ioredis"

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const CHANNEL_PREFIX = process.env.REDIS_PREFIX || '';

const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
});

export function publish(channel: string, message: any) {
    const channelName = `${CHANNEL_PREFIX}${channel}`;
    redis.publish(channelName, JSON.stringify(message));
    console.log(`Published to ${channelName}:`, message);
}
