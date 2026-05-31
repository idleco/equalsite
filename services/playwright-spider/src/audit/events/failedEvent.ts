import type { EventPublisherParams } from "../repositories/eventPublisher";

export const failedEvent = (payload: {
    auditId: string;
    error: string;
}): EventPublisherParams<'audit.failed'> => ({
    type: 'audit.failed',
    payload
})
