import type { Job } from "bullmq";
export type JobPayload = {
    crawlId: string;
    url: string;
    callbackUrl: string;
};
export declare function runAuditJob(job: Job<{
    crawlId: string;
    url: string;
    callbackUrl: string;
}>): Promise<void>;
