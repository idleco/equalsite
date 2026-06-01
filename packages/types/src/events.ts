import { QueueStatus, ServerityBreakdown, StatisticState } from './common';

export enum EventEnum {
    Queued = 'audit.queued',
    Started = 'audit.started',
    Progress = 'audit.progress',
    Completed = 'audit.completed',
    Failed = 'audit.failed',
    Cancelled = 'audit.cancelled',
    PageStarted = 'audit.page.started',
    PageFailed = 'audit.page.failed',
    PageCompleted = 'audit.page.completed',
    CrawlerTelemetry = 'crawler.telemetry',
}

export type EventType = keyof EventPayloadMap;

export type EventEnumKeys = keyof typeof EventEnum;

export interface EventPayloadMap {
    [EventEnum.Queued]: QueuedPayload;
    [EventEnum.Started]: StartedPayload;
    [EventEnum.Progress]: ProgressPayload;
    [EventEnum.Completed]: CompletedPayload;
    [EventEnum.Failed]: FailedPayload;
    [EventEnum.Cancelled]: CancelledPayload;
    [EventEnum.PageStarted]: PageStartedPayload;
    [EventEnum.PageFailed]: PageFailedPayload;
    [EventEnum.PageCompleted]: PageCompletedPayload;
    [EventEnum.CrawlerTelemetry]: TelemetryPayload;
}

export interface PageStartedPayload {
    auditId: string;
    pageUrl: string;
    attemptsCount: number;
}

export interface PageFailedPayload {
    auditId: string;
    pageUrl: string;
    attemptsCount: number;
    errorMessage: string;
}

export interface PageCompletedPayload {
    auditId: string;
    pageUrl: string;
    accessibilityViolationsCount: number;
    severityBreakdown: ServerityBreakdown;
}

export interface ProgressPayload {
    auditId: string;
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
    progressPercentage: number;
}

export interface QueuedPayload extends QueueStatus {
    auditId: string;
}

export interface FailedPayload {
    auditId: string;
    error: string;
}

export interface CompletedPayload extends StatisticState {
    auditId: string;
}

export interface CancelledPayload extends StatisticState {
    auditId: string;
}

export interface StartedPayload {
    auditId: string;
}

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

export interface PublishedEvent<T = EventType, P = unknown> {
    type: T;
    payload: P;
    version: string;
    timestamp: number;
}

export type TelemetryEvent = PublishedEvent<'crawler.telemetry', TelemetryPayload>;
export type CompletedEvent = PublishedEvent<'audit.completed', CompletedPayload>;
export type FailedEvent = PublishedEvent<'audit.failed', FailedPayload>;
export type CancelledEvent = PublishedEvent<'audit.cancelled', CancelledPayload>;
export type StartedEvent = PublishedEvent<'audit.started', StartedPayload>;
export type QueuedEvent = PublishedEvent<'audit.queued', QueuedPayload>;
export type PageStartedEvent = PublishedEvent<'audit.page.started', PageStartedPayload>;
export type PageFailedEvent = PublishedEvent<'audit.page.failed', PageFailedPayload>;
export type PageCompletedEvent = PublishedEvent<'audit.page.completed', PageCompletedPayload>;
export type ProgressEvent = PublishedEvent<'audit.progress', ProgressPayload>;
