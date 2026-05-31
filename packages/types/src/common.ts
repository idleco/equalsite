export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';

export type ImpactKey = Exclude<ImpactLevel, null>;

type AllKeysRequired<T extends Record<ImpactKey, number>> =
  Pick<T, ImpactKey> & Partial<Record<Exclude<keyof T, ImpactKey>, never>>;

export type ServerityBreakdown = AllKeysRequired<Record<ImpactLevel, number>>;

export interface Stats {
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}

export interface QueueStatus {
    position: number;
    ahead: number;
    waiting: number;
}


export interface ProgressState {
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
    progressPercentage: number
}

export interface StatisticState {
    requestsFinished: number;
    requestsFailed: number;
    requestsRetries: number;
    requestsFailedPerMinute: number;
    requestsFinishedPerMinute: number;
    requestMinDurationMillis: number;
    requestMaxDurationMillis: number;
    requestTotalFailedDurationMillis: number;
    requestTotalFinishedDurationMillis: number;
    crawlerStartedAt: Date | string | null;
    crawlerFinishedAt: Date | string | null;
    crawlerRuntimeMillis: number;
    statsPersistedAt: Date | string | null;
    errors: Record<string, unknown>;
    retryErrors: Record<string, unknown>;
    requestsWithStatusCode: Record<string, number>;
}
