import { redis } from "../lib/redis";
const VERSION = '1';
const client = ({ channel, version = VERSION }) => ({
    publish: async (event) => {
        const data = {
            channel,
            type: event.type,
            payload: event.payload,
            version,
        };
        try {
            const id = await redis.xadd(channel, '*', 'data', JSON.stringify(data));
            console.log('[Redis] Stream Published', {
                id,
                data: event
            });
        }
        catch (err) {
            console.error(err);
        }
    }
});
export default client;
//# sourceMappingURL=client.js.map