import type { StatisticState } from "crawlee";
import type { EventPublisherParams } from "../repositories/eventPublisher";

export const completedEvent = (payload: {
    auditId: string;
    statistics: StatisticState
}): EventPublisherParams<'audit.completed'> => ({
    type: 'audit.completed',
    payload: {
        auditId: payload.auditId,
        ...payload.statistics
    }
})
