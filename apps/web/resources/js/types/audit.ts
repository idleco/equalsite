import type { ProgressState, QueueStatus, ServerityBreakdown } from "@equalsite/types";

export type ScanStatus = 'queued' | 'started' | 'failed' | 'cancelled' | 'completed';

export type UrlStatus = 'started' | 'failed' | 'completed' | 'skipped';

export type ScanQueue = QueueStatus
export type ScanProgress = ProgressState;

export type ScanInfo = {
    auditId: string;
    siteUrl: string;
    status: ScanStatus;
    failureReason?: string,
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    createdAt: string;
}

export type ScannedUrl = {
    status: UrlStatus;
    attemptsCount: number;
    startedAt: string;
    skippedAt?: string;
    failedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    skippingReason?: string;
    accessibilityViolationsCount?: number;
    severityBreakdown?: ServerityBreakdown;
}

