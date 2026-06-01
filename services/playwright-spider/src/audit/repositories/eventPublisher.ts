import type { EventPayloadMap, EventType } from "@equalsite/types";

export { EventType };

export type EventPayload<T extends EventType> = EventPayloadMap[T];

export type EventPublisherParams<T extends EventType> = {
    type: T;
    payload: EventPayloadMap[T];
}

export type EventPublisher = <T extends EventType>(event: EventPublisherParams<T>) => Promise<void>

