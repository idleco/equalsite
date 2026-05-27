import { QueueEvents } from "bullmq";
import { bullMqRedis } from "../lib/redis";
import { QUEUE_NAME } from "./constants";

export const crawlEvents = new QueueEvents(QUEUE_NAME, {
    connection: bullMqRedis
});
