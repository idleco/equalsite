import { crawlQueue } from "../queue/crawlQueue";
import { publishEvent } from "./publishEvent";

export async function publishQueuePositions() {
    const waiting = await crawlQueue.getWaiting();
    await Promise.all(
        waiting.map(async (job, index) => {
            await publishEvent({
                type: 'audit.queued',
                payload: {
                    crawlId: job.id,
                    position: index + 1,
                    ahead: index,
                    waiting: waiting.length
                }
            });
        })
    );
}
