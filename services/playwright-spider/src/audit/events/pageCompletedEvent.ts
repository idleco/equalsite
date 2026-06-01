import { EventEnum, ServerityBreakdown } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageCompletedEvent = (payload: {
    auditId: string;
    pageUrl: string;
    accessibilityViolationsCount: number;
    severityBreakdown: ServerityBreakdown
}): EventPublisherParams<typeof EventEnum.PageCompleted> => ({
    type: EventEnum.PageCompleted,
    payload
})
