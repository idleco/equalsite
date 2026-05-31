import { cancelledEvent } from "../events/cancelledEvent";
import type { AuditRepository } from "../repositories/auditRepository";
import type { EventPublisher } from "../repositories/eventPublisher";
import { crawlerMap } from "../services/crawlerMap";
import { deleteDirectoryIfExists } from "../utils/fsDirectory";

export interface ICancelAuditAction {
    run: (auditId: string) => Promise<void>;
}

export const createCancelAuditAction = (
    auditRepository: AuditRepository,
    eventPublisher: EventPublisher,
    artifactDirectory: string
): ICancelAuditAction => ({
    run: async (auditId) => {
        const audit = await auditRepository.findOrFail(auditId);

        if (! audit.status.is('active')) {
            return;
        }

        await auditRepository.save(audit.markAsCancelled());

        try {
            const crawler = crawlerMap.get(audit.id);
            if (crawler) {
                await eventPublisher(cancelledEvent({
                    auditId,
                    statistics: crawler.stats.state
                }));
                await crawler.teardown();
            }
            await deleteDirectoryIfExists(artifactDirectory);
        } catch (err) {
            console.error(err);
        } finally {
            await auditRepository.delete(audit.id);
            crawlerMap.delete(audit.id);
        }
    }
})
