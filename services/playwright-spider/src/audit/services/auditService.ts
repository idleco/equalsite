import { PlaywrightCrawler, StatisticState } from "crawlee";
import AuditEntity from "../entities/audit";
import { AuditRepository } from "../repositories/auditRepository";
import { EventPublisher } from "../repositories/eventPublisher";
import { completedEvent } from "../events/completedEvent";
import { startedEvent } from "../events/startedEvent";
import { failedEvent } from "../events/failedEvent";
import { cancelledEvent } from "../events/cancelledEvent";


export const createAuditService = (
    auditRepository: AuditRepository,
    eventPublisher: EventPublisher
) => ({
    startAudit: async (
        audit: AuditEntity,
    ) => {
        return await Promise.allSettled([
            auditRepository.save(audit.markAsActive()),
            eventPublisher(startedEvent({
                auditId: audit.id
            }))
        ]);
    },

    cancelAudit: async (
        audit: AuditEntity,
        crawler: PlaywrightCrawler
    ) => {
        return await Promise.allSettled([
            auditRepository.save(audit.markAsCancelled()),
            eventPublisher(cancelledEvent({
                auditId: audit.id,
                statistics: crawler.stats.state
            }))
        ]);
    },

    completeAudit: async (
        audit: AuditEntity,
        crawler: PlaywrightCrawler
    ) => {
        return await Promise.allSettled([
            auditRepository.save(audit.markAsCompleted()),
            eventPublisher(completedEvent({
                auditId: audit.id,
                statistics: crawler.stats.state
            }))
        ]);
    },

    failAudit: async (
        audit: AuditEntity,
        err: unknown
    ) => {
        const error = typeof err === 'string' ? err : (err as Error).message;
        return await Promise.allSettled([
            auditRepository.save(audit.markAsFailed(error)),
            eventPublisher(failedEvent({
                auditId: audit.id,
                error
            }))
        ]);
    },
})
