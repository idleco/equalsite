import type { AxeResults } from 'axe-core';
export declare const publisher: {
    publish<T extends "started" | "progress" | "completed" | "cancelled" | "failed">(type: T, payload: {
        started: import("./types").StartedPayload;
        completed: import("./types").CompletedPayload;
        cancelled: import("./types").CancelledPayload;
        progress: import("./types").ProgressPayload;
        failed: import("./types").FailedPayload;
    }[T]): Promise<void>;
};
export declare function emitStarted({ crawlId, url }: {
    crawlId: string;
    url: string;
}): Promise<void>;
export declare function emitCancelled({ crawlId }: {
    crawlId: string;
}): Promise<void>;
export declare function emitCompleted({ crawlId, }: {
    crawlId: string;
}): Promise<void>;
export declare function emitFailed({ crawlId, url, errors, }: {
    crawlId: string;
    url: string;
    errors: string[];
}): Promise<void>;
export declare function emitProgress({ crawlId, url, axeResults }: {
    crawlId: string;
    url: string;
    axeResults: AxeResults;
}): Promise<void>;
