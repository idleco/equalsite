import type { Status } from "@equalsite/types";

export interface Audit {
    isActive: boolean;
    failureReason?: string;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    createdAt: string;
    status: Status;
    siteUrl: string;
    id: string;
    crawlId: string;
}
