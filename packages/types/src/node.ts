import { Stats, ServerityBreakdown } from "./common";

export type EventType = 'started' | 'progress' | 'completed' | 'cancelled' | 'failed';

interface BasePayload {
    url: string
    crawlId: string;
    timestamp: string
    stats: Stats;
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
