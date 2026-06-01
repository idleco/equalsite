type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';
type ImpactKey = Exclude<ImpactLevel, null>;
type AllKeysRequired<T extends Record<ImpactKey, number>> = Pick<T, ImpactKey> & Partial<Record<Exclude<keyof T, ImpactKey>, never>>;
type ServerityBreakdown = AllKeysRequired<Record<ImpactLevel, number>>;
interface Stats {
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}
interface QueueStatus {
    position: number;
    ahead: number;
    waiting: number;
}
interface ProgressState {
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
    progressPercentage: number;
}
interface StatisticState {
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

declare enum EventEnum {
    Queued = "audit.queued",
    Started = "audit.started",
    Progress = "audit.progress",
    Completed = "audit.completed",
    Failed = "audit.failed",
    Cancelled = "audit.cancelled",
    PageStarted = "audit.page.started",
    PageFailed = "audit.page.failed",
    PageCompleted = "audit.page.completed",
    CrawlerTelemetry = "crawler.telemetry"
}
type EventType = keyof EventPayloadMap;
type EventEnumKeys = keyof typeof EventEnum;
interface EventPayloadMap {
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
interface PageStartedPayload {
    auditId: string;
    pageUrl: string;
    attemptsCount: number;
}
interface PageFailedPayload {
    auditId: string;
    pageUrl: string;
    attemptsCount: number;
    errorMessage: string;
}
interface PageCompletedPayload {
    auditId: string;
    pageUrl: string;
    accessibilityViolationsCount: number;
    severityBreakdown: ServerityBreakdown;
}
interface ProgressPayload {
    auditId: string;
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
    progressPercentage: number;
}
interface QueuedPayload extends QueueStatus {
    auditId: string;
}
interface FailedPayload {
    auditId: string;
    error: string;
}
interface CompletedPayload extends StatisticState {
    auditId: string;
}
interface CancelledPayload extends StatisticState {
    auditId: string;
}
interface StartedPayload {
    auditId: string;
}
interface TelemetryPayload {
    process: {
        pid: number;
        uptime: number;
        memory: {
            rss: number;
            heapUsed: number;
            heapTotal: number;
        };
    };
    system: {
        loadAverage: number[];
        freeMemory: number;
        totalMemory: number;
    };
    queue: {
        waiting: number;
        active: number;
    };
    crawlers: {
        active: number;
    };
}
interface PublishedEvent<T = EventType, P = unknown> {
    type: T;
    payload: P;
    version: string;
    timestamp: number;
}
type TelemetryEvent = PublishedEvent<'crawler.telemetry', TelemetryPayload>;
type CompletedEvent = PublishedEvent<'audit.completed', CompletedPayload>;
type FailedEvent = PublishedEvent<'audit.failed', FailedPayload>;
type CancelledEvent = PublishedEvent<'audit.cancelled', CancelledPayload>;
type StartedEvent = PublishedEvent<'audit.started', StartedPayload>;
type QueuedEvent = PublishedEvent<'audit.queued', QueuedPayload>;
type PageStartedEvent = PublishedEvent<'audit.page.started', PageStartedPayload>;
type PageFailedEvent = PublishedEvent<'audit.page.failed', PageFailedPayload>;
type PageCompletedEvent = PublishedEvent<'audit.page.completed', PageCompletedPayload>;
type ProgressEvent = PublishedEvent<'audit.progress', ProgressPayload>;

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

interface StreamData<T> {
    data: T;
}
type PageStartedStream = StreamData<PageStartedEvent>;
type PageFailedStream = StreamData<PageFailedEvent>;
type PageCompletedStream = StreamData<PageCompletedEvent>;
type ProgressStream = StreamData<ProgressEvent>;
type QueuedStream = StreamData<QueuedEvent>;
type FailedStream = StreamData<FailedEvent>;
type CompletedStream = StreamData<CompletedEvent>;
type StartedStream = StreamData<StartedEvent>;
type CancelledStream = StreamData<CancelledEvent>;
type TelemetryStream = StreamData<TelemetryEvent>;

export { type CancelledEvent, type CancelledPayload, type CancelledStream, type CompletedEvent, type CompletedPayload, type CompletedStream, EventEnum, type EventEnumKeys, type EventPayloadMap, type EventType, type FailedEvent, type FailedPayload, type FailedStream, type ImpactKey, type ImpactLevel, type PageCompletedEvent, type PageCompletedPayload, type PageCompletedStream, type PageFailedEvent, type PageFailedPayload, type PageFailedStream, type PageStartedEvent, type PageStartedPayload, type PageStartedStream, type ProgressEvent, type ProgressPayload, type ProgressState, type ProgressStream, type ProgressWebSocketEvent, type PublishedEvent, type QueueStatus, type QueuedEvent, type QueuedPayload, type QueuedStream, type ServerityBreakdown, type StartedEvent, type StartedPayload, type StartedStream, type StatisticState, type Stats, type Status, type TelemetryEvent, type TelemetryPayload, type TelemetryStream, type UpdatedWebSocketEvent, type WebSocketEventType };
