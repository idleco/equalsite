import type { ImpactValue } from "axe-core";
export interface Client {
    publish: (event: {
        type: string;
        payload: unknown;
    }) => Promise<void>;
}
type ImpactKey = Exclude<ImpactValue, null>;
type AllKeysRequired<T extends Record<ImpactKey, number>> = Pick<T, ImpactKey> & Partial<Record<Exclude<keyof T, ImpactKey>, never>>;
interface BasePayload {
    url: string;
    crawlId: string;
    timestamp: string;
    stats: Stats;
}
type ServerityBreakdown = AllKeysRequired<Record<ImpactKey, number>>;
export interface Stats {
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}
export type StartedPayload = Omit<BasePayload, 'stats'>;
export type CompletedPayload = Omit<BasePayload, 'url'>;
export type CancelledPayload = Omit<BasePayload, 'url'>;
export interface ProgressPayload extends BasePayload {
    url: string;
    violations: number;
    severityBreakdown: ServerityBreakdown;
}
export interface FailedPayload extends BasePayload {
    url: string;
    errors: string[];
}
export {};
