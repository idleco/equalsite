import type { ServerityBreakdown, Status } from "@equalsite/types";

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

export interface ProcessedUrl {
    url: string;
    violations: number;
    severityBreakdown: ServerityBreakdown;
    timestamp: string
}
