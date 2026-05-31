import type { StatisticState } from "crawlee";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const cancelledEvent = (payload: {
    auditId: string;
    statistics: StatisticState
}): EventPublisherParams<'audit.cancelled'> => ({
    type: 'audit.cancelled',
    payload: {
        auditId: payload.auditId,
        ...payload.statistics
    }
})
