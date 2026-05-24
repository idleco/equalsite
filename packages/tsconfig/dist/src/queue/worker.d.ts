import { Worker } from "bullmq";
import type { JobPayload } from "../crawler/auditJob";
export declare const crawlWorker: Worker<JobPayload, any, string>;
