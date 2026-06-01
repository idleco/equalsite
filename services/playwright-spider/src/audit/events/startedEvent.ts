import { EventEnum } from "@equalsite/types";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const startedEvent = (payload: {
    auditId: string;
}): EventPublisherParams<typeof EventEnum.Started> => ({
    type: EventEnum.Started,
    payload
});
