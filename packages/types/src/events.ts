import { QueueStatus, ServerityBreakdown, StatisticState } from "./common";

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
    | 'audit.page.failed'
    | 'audit.page.completed'
    | 'crawler.telemetry';

interface PublishedEvent<T = EventType, P = unknown> {
    type: T;
    payload: P;
    version: string;
    timestamp: number;
}

export interface PageFailedPayload {
    auditId: string;
    pageUrl: string;
    attemptsCount: number;
    errorMessage: string;
}

export type PageFailedEvent = PublishedEvent<'audit.page.failed', PageFailedPayload>;
export type PageFailedStream = StreamData<PageFailedEvent>;

export interface PageCompletedPayload {
    auditId: string;
    pageUrl: string;
    accessibilityViolationsCount: number;
    severityBreakdown: ServerityBreakdown
}

export type PageCompletedEvent = PublishedEvent<'audit.page.completed', PageCompletedPayload>;
export type PageCompletedStream = StreamData<PageCompletedEvent>;

export interface ProgressPayload {
    auditId: string;
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
    progressPercentage: number
}

export type ProgressEvent = PublishedEvent<'audit.progress', ProgressPayload>;
export type ProgressStream = StreamData<ProgressEvent>;

export interface QueuedPayload extends QueueStatus {
    auditId: string;
}

export type QueuedEvent = PublishedEvent<'audit.queued', QueuedPayload>;
export type QueuedStream = StreamData<QueuedEvent>;

export interface FailedPayload {
    auditId: string;
    error: string;
}

export type FailedEvent = PublishedEvent<'audit.failed', FailedPayload>;
export type FailedStream = StreamData<FailedEvent>;

export interface CompletedPayload extends StatisticState {
    auditId: string;
}

export type CompletedEvent = PublishedEvent<'audit.completed', CompletedPayload>;
export type CompletedStream = StreamData<CompletedEvent>;

export interface StartedPayload {
    auditId: string;
}

export type StartedEvent = PublishedEvent<'audit.started', StartedPayload>;
export type StartedStream = StreamData<StartedEvent>;

export interface CancelledPayload extends StatisticState {
    auditId: string;
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
