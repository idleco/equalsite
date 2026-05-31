import type {
    CancelledPayload,
    CompletedPayload,
    EventType,
    FailedPayload,
    PageCompletedPayload,
    PageFailedPayload,
    ProgressPayload,
    QueuedPayload,
    StartedPayload,
    TelemetryPayload
} from "@equalsite/types";

interface EventMap {
    'audit.queued': QueuedPayload;
    'audit.progress': ProgressPayload;
    'audit.started': StartedPayload;
    'audit.completed': CompletedPayload;
    'audit.failed': FailedPayload;
    'audit.cancelled': CancelledPayload;
    'crawler.telemetry': TelemetryPayload;
    'audit.page.completed': PageCompletedPayload;
    'audit.page.failed': PageFailedPayload;
};

export { EventType };

export type EventPayload<T extends EventType> = EventMap[T];

export type EventPublisherParams<T extends EventType> = {
    type: T;
    payload: EventPayload<T>;
}

export type EventPublisher = <T extends EventType>(event: EventPublisherParams<T>) => Promise<void>

