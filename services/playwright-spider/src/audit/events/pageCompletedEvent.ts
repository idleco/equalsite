import type { ServerityBreakdown } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageCompletedEvent = (payload: {
    auditId: string;
    pageUrl: string;
    accessibilityViolationsCount: number;
    severityBreakdown: ServerityBreakdown
}): EventPublisherParams<'audit.page.completed'> => ({
    type: 'audit.page.completed',
    payload
})
