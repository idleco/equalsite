import type { ProgressState, QueueStatus, ServerityBreakdown } from "@equalsite/types";

export enum ImpactLevel {
    critical = 0,
    serious = 1,
    moderate = 2,
    minor = 3
}

export type ImpactLevelKey = keyof typeof ImpactLevel;

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

export interface RemediationSampleNode {
    url: string;
    target: string;
    html: string;
    fingerprint: string;
}

export interface RemediationGroup {
    violationId: number;
    ruleId: string;
    impact: string;
    impactLabel: string;
    summary: string;
    failureSummary: string | null;
    helpUrl: string | null;
    fixInstruction: string | null;
    remediationScope: string;
    clusterReason: string;
    affectedPagesCount: number;
    instancesCount: number;
    samplePages: string[];
    sampleTargets: string[];
    sampleNodes: RemediationSampleNode[];
    affectedPages: string[];
}

export interface Remediation {
    groupsCount: number;
    groups: RemediationGroup[];
}

export interface DiscoveredPageViolation {
    id: number;
    ruleId: string;
    impact: string;
    impactLabel: string;
    summary: string;
    instancesOnPage: number;
}

export interface ReportPages {
    discovered: string[];
    atRisk: PageAtRisk[];
    violationsByUrl: Record<string, DiscoveredPageViolation[]>;
}

export interface PageAtRisk {
    url: string;
    issuesFound: number;
}
