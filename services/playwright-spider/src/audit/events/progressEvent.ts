import { EventEnum } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const progressEvent = (payload: {
    auditId: string;
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
}): EventPublisherParams<typeof EventEnum.Progress> => ({
    type: EventEnum.Progress,
    payload: {
        ...payload,
        progressPercentage: Math.floor((payload.completedRequests / payload.totalRequests) * 100)
    }
});
