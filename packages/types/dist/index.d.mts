type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';
type ImpactKey = Exclude<ImpactLevel, null>;
type AllKeysRequired<T extends Record<ImpactKey, number>> = Pick<T, ImpactKey> & Partial<Record<Exclude<keyof T, ImpactKey>, never>>;
type ServerityBreakdown = AllKeysRequired<Record<ImpactKey, number>>;
interface Stats {
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}

type Status = 'queued' | 'started' | 'cancelled' | 'failed' | 'completed';
type WebSocketEventType = 'audit.progress' | 'audit.updated';
interface WebSocketEvent<T> {
    event: WebSocketEventType;
    data: T;
}
type UpdatedWebSocketEvent = WebSocketEvent<{
    cancelledAt?: string;
    completedAt?: string;
    id: string;
    failureReason?: string;
    startedAt?: string;
    status: Status;
    stats?: Stats;
}>;
type ProgressWebSocketEvent = WebSocketEvent<{
    violations: number;
    id: string;
    url: string;
    stats: Stats;
    timestamp: string;
    severityBreakdown: ServerityBreakdown;
}>;

type EventType = 'started' | 'progress' | 'completed' | 'cancelled' | 'failed';
interface BasePayload {
    url: string;
    crawlId: string;
    timestamp: string;
    stats: Stats;
}
type StartedPayload = Omit<BasePayload, 'stats'>;
type CompletedPayload = Omit<BasePayload, 'url'>;
type CancelledPayload = Omit<BasePayload, 'url'>;
interface ProgressPayload extends BasePayload {
    url: string;
    violations: number;
    severityBreakdown: ServerityBreakdown;
}
interface FailedPayload extends BasePayload {
    url: string;
    errors: string[];
}

export type { CancelledPayload, CompletedPayload, EventType, FailedPayload, ImpactKey, ImpactLevel, ProgressPayload, ProgressWebSocketEvent, ServerityBreakdown, StartedPayload, Stats, Status, UpdatedWebSocketEvent, WebSocketEventType };
