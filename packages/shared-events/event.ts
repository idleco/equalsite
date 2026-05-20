export enum EventType {
    started = 'started',
    completed = 'completed',
    cancelled = 'cancelled',
    failed = 'failed',
    progress = 'progress',
}

export interface StreamPublisherParams<T> {
    channel: string,
    type: EventType,
    payload: T,
    version: string,
}

export interface CrawlStats {
    totalRequests: number;
    pendingRequests: number;
    processedRequests: number;
    failedRequests: number;
    concurrency: number;
}

export interface StartedEvent {
    crawlId: string;
    timestamp: string;
}

export interface CancelledEvent {
    crawlId: string;
    timestamp: string;
    stats: CrawlStats
}

export interface FailedEvent {
    crawlId: string;
    url: string;
    errors: string[];
    stats: CrawlStats;
    timestamp: string;
}

export interface CompletedEvent {
    crawlId: string;
    timestamp: string;
    stats: CrawlStats;
}

export interface ProgressEvent {
    crawlId: string;
    url: string;
    timestamp: string;
    violations: number;
    status: CrawlStats
}
