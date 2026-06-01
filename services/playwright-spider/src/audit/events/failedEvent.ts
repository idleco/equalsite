import { EventEnum } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const failedEvent = (payload: {
    auditId: string;
    error: string;
}): EventPublisherParams<typeof EventEnum.Failed> => ({
    type: EventEnum.Failed,
    payload
})
