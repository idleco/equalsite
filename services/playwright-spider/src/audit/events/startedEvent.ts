import type { EventPublisherParams } from "../repositories/eventPublisher";

export const startedEvent = (payload: {
    auditId: string;
}): EventPublisherParams<'audit.started'> => ({
    type: 'audit.started',
    payload
})
