import type { ServerityBreakdown } from "@equalsite/types";
import { EventEnum } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageCompletedEvent = (payload: {
    auditId: string;
    pageUrl: string;
    violationsCount: number;
    passesCount?: number;
    severityBreakdown: ServerityBreakdown
}): EventPublisherParams<typeof EventEnum.PageCompleted> => ({
    type: EventEnum.PageCompleted,
    payload
});
