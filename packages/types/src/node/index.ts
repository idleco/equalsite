import type {
    PageStartedEvent,
    CancelledEvent,
    CompletedEvent,
    FailedEvent,
    PageCompletedEvent,
    PageFailedEvent,
    ProgressEvent,
    QueuedEvent,
    StartedEvent,
    TelemetryEvent,
    PageSkippedEvent
} from "../events";

interface StreamData<T> {
    data: T
}

export type PageStartedStream = StreamData<PageStartedEvent>;
export type PageSkippedStream = StreamData<PageSkippedEvent>
export type PageFailedStream = StreamData<PageFailedEvent>;
export type PageCompletedStream = StreamData<PageCompletedEvent>;
export type ProgressStream = StreamData<ProgressEvent>;
export type QueuedStream = StreamData<QueuedEvent>;
export type FailedStream = StreamData<FailedEvent>;
export type CompletedStream = StreamData<CompletedEvent>;
export type StartedStream = StreamData<StartedEvent>;
export type CancelledStream = StreamData<CancelledEvent>;
export type TelemetryStream = StreamData<TelemetryEvent>;

export type * from './api';
