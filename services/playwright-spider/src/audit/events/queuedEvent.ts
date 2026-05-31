import type { EventPublisherParams } from "../repositories/eventPublisher";

export const queuedEvent = (payload: {
    auditId: string;
    position: number;
    ahead: number;
    waiting: number;
}): EventPublisherParams<'audit.queued'> => ({
    type: 'audit.queued',
    payload
})
