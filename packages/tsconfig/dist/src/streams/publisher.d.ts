import type { CancelledPayload, Client, CompletedPayload, FailedPayload, ProgressPayload, StartedPayload } from "./types";
type EventType = 'started' | 'progress' | 'completed' | 'cancelled' | 'failed';
type EventPayloadMap = {
    started: StartedPayload;
    completed: CompletedPayload;
    cancelled: CancelledPayload;
    progress: ProgressPayload;
    failed: FailedPayload;
};
declare const publisher: (client: Client) => {
    publish<T extends EventType>(type: T, payload: EventPayloadMap[T]): Promise<void>;
};
export default publisher;
