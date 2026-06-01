import { EventEnum } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const queuedEvent = (payload: {
    auditId: string;
    position: number;
    ahead: number;
    waiting: number;
}): EventPublisherParams<typeof EventEnum.Queued> => ({
    type: EventEnum.Queued,
    payload
});
