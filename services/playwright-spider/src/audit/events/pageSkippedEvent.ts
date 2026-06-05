import { EventEnum } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageSkippedEvent = (payload: {
    auditId: string;
    pageUrl: string;
    reason: string;
}): EventPublisherParams<typeof EventEnum.PageSkipped> => ({
    type: EventEnum.PageSkipped,
    payload
});
