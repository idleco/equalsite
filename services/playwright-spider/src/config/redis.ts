const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPrefix = process.env.REDIS_PREFIX || '';

export default {
    redisHost,
    redisPort,
    redisPrefix,
}
