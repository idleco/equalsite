export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';

export type ImpactKey = Exclude<ImpactLevel, null>;

type AllKeysRequired<T extends Record<ImpactKey, number>> =
  Pick<T, ImpactKey> & Partial<Record<Exclude<keyof T, ImpactKey>, never>>;

export type ServerityBreakdown = AllKeysRequired<Record<ImpactKey, number>>;

export interface Stats {
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}
