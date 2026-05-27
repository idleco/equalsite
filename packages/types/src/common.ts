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
