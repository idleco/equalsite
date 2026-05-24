export type {
    CancelledPayload,
    ProgressPayload,
    StartedPayload,
    FailedPayload,
    CompletedPayload,
    EventType,
    Stats
} from '@equalsite/types';

export interface Client {
    publish: (event: {
        type: string;
        payload: unknown;
    }) => Promise<void>
}
