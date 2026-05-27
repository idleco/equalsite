import { ProgressState, QueueStatus, ServerityBreakdown } from "./common";

export interface StreamData<T> {
    data: T
}

export type EventType =
    | 'audit.queued'
    | 'audit.started'
    | 'audit.progress'
    | 'audit.completed'
    | 'audit.failed'
    | 'audit.cancelled'
    | 'crawler.telemetry';

interface PublishedEvent<T = EventType, P = unknown> {
    type: T;
    payload: P;
    version: string;
    timestamp: number;
}

export interface ProgressPayload extends ProgressState {
    crawlId: string;
    currentUrl?: string;
    violations: number;
    severityBreakdown: ServerityBreakdown
}

export type ProgressEvent = PublishedEvent<'audit.progress', ProgressPayload>;
export type ProgressStream = StreamData<ProgressEvent>;

export interface QueuedPayload extends QueueStatus {
    crawlId?: string;
}

export type QueuedEvent = PublishedEvent<'audit.queued', QueuedPayload>;
export type QueuedStream = StreamData<QueuedEvent>;

export interface FailedPayload {
    crawlId?: string;
    error: string;
}

export type FailedEvent = PublishedEvent<'audit.failed', FailedPayload>;
export type FailedStream = StreamData<FailedEvent>;

export interface CompletedPayload {
    crawlId?: string;
}

export type CompletedEvent = PublishedEvent<'audit.completed', CompletedPayload>;
export type CompletedStream = StreamData<CompletedEvent>;

export interface StartedPayload {
    crawlId?: string;
}

export type StartedEvent = PublishedEvent<'audit.started', StartedPayload>;
export type StartedStream = StreamData<StartedEvent>;

export interface CancelledPayload {
    crawlId: string;
}

export type CancelledEvent = PublishedEvent<'audit.cancelled', CancelledPayload>;
export type CancelledStream = StreamData<CancelledEvent>;

export interface TelemetryPayload {
    process: {
        pid: number;
        uptime: number;
        memory: {
            rss: number;
            heapUsed: number;
            heapTotal: number;
        }
    },
    system: {
        loadAverage: number[];
        freeMemory: number;
        totalMemory: number;
    },
    queue: {
        waiting: number;
        active: number;
    },
    crawlers: {
        active: number;
    },
}

export type TelemetryEvent = PublishedEvent<'crawler.telemetry', TelemetryPayload>;
export type TelemetryStream = StreamData<TelemetryEvent>;
