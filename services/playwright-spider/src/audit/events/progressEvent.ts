import { EventEnum } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageProgressEvent = (payload: {
    auditId: string;
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
    progressPercentage: number
}): EventPublisherParams<typeof EventEnum.Progress> => ({
    type: EventEnum.Progress,
    payload
})
