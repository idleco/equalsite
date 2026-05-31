import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageFailedEvent = (payload: {
    auditId: string;
    pageUrl: string;
    attemptsCount: number;
    errorMessage: string;
}): EventPublisherParams<'audit.page.failed'> => ({
    type: 'audit.page.failed',
    payload
})
