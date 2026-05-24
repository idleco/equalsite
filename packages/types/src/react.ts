import { ServerityBreakdown, Stats } from "./common";

export type Status = 'queued' | 'started' | 'cancelled' | 'failed' | 'completed';

export type WebSocketEventType = 'audit.progress' | 'audit.updated';

interface WebSocketEvent<T> {
    event: WebSocketEventType;
    data: T;
};

export type UpdatedWebSocketEvent = WebSocketEvent<{
    cancelledAt?: string;
    completedAt?: string;
    id: string;
    failureReason?: string;
    startedAt?: string;
    status: Status;
    stats?: Stats
}>;

export type ProgressWebSocketEvent = WebSocketEvent<{
    violations: number;
    id: string;
    url: string;
    stats: Stats;
    timestamp: string;
    severityBreakdown: ServerityBreakdown;
}>;
