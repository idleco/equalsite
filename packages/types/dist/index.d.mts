declare enum EventType {
    started = "started",
    completed = "completed",
    cancelled = "cancelled",
    failed = "failed",
    progress = "progress"
}
interface StreamPublisherParams<T> {
    channel: string;
    type: EventType;
    payload: T;
    version: string;
}
interface CrawlStats {
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}
interface StartedEvent {
    crawlId: string;
    timestamp: string;
}
interface CancelledEvent {
    crawlId: string;
    timestamp: string;
    stats: CrawlStats;
}
interface FailedEvent {
    crawlId: string;
    url: string;
    errors: string[];
    stats: CrawlStats;
    timestamp: string;
}
interface CompletedEvent {
    crawlId: string;
    timestamp: string;
    stats: CrawlStats;
}
interface ProgressEvent {
    crawlId: string;
    url: string;
    timestamp: string;
    violations: number;
    status: CrawlStats;
}

export { type CancelledEvent, type CompletedEvent, type CrawlStats, EventType, type FailedEvent, type ProgressEvent, type StartedEvent, type StreamPublisherParams };
