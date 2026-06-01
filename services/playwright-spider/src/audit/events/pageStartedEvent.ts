import { EventEnum } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const pageStartedEvent = (payload: {
    auditId: string;
    pageUrl: string;
    attemptsCount: number;
}): EventPublisherParams<typeof EventEnum.PageStarted> => ({
    type: EventEnum.PageStarted,
    payload
})
