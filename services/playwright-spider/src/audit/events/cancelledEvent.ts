import type { StatisticState } from "crawlee";
import type { EventPublisherParams } from "../repositories/eventPublisher";
import { EventEnum } from "@equalsite/types";

export const cancelledEvent = (payload: {
    auditId: string;
    statistics: StatisticState
}): EventPublisherParams<typeof EventEnum.Cancelled> => ({
    type: EventEnum.Cancelled,
    payload: {
        auditId: payload.auditId,
        ...payload.statistics
    }
})
