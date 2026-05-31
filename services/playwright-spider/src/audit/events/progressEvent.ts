import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageProgressEvent = (payload: {
    auditId: string;
    completedRequests: number;
    pendingRequests: number;
    totalRequests: number;
    progressPercentage: number
}): EventPublisherParams<'audit.progress'> => ({
    type: 'audit.progress',
    payload
})
