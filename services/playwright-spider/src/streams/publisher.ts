import type {
    CancelledPayload, Client, CompletedPayload,
    EventType, FailedPayload, ProgressPayload,
    StartedPayload
} from "./types";

type EventPayloadMap = {
    started: StartedPayload;
    completed: CompletedPayload;
    cancelled: CancelledPayload;
    progress: ProgressPayload;
    failed: FailedPayload
}

const publisher = (client: Client) => {
    return {
        async publish<T extends EventType>(
            type: T,
            payload: EventPayloadMap[T]
        ): Promise<void> {
            await client.publish({
                type,
                payload
            });
        }
    }
}

export default publisher;
