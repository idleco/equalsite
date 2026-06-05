import type { AuditRepository } from "../repositories/auditRepository";
import createPlaywrightCrawler from "./crawlerFactory";
import type { EventPublisher } from "../repositories/eventPublisher";
import { createReleaseArtifactsAction } from "./releaseArtifacts";
import { crawlerMap } from "../services/crawlerMap";
import type AuditEntity from "../entities/audit";
import { deleteFileIfExists } from "../utils/fsDirectory";
import { createAuditService } from "../services/auditService";

export interface IRunAuditAction {
    run: (auditId: string) =>  Promise<void>;
}

export const createRunAuditAction = (
    auditRepository: AuditRepository,
    eventPublisher: EventPublisher,
    config: {
        secretKey: string;
        artifactDirectory: string;
        archiveDirectory: string;
    }
): IRunAuditAction => {
    const {
        artifactDirectory,
        archiveDirectory,
        secretKey
    } = config;

    const auditService = createAuditService(auditRepository, eventPublisher);
    const releaseArtifactsAction = createReleaseArtifactsAction(auditRepository, secretKey);

    async function performAuditCleanup(audit: AuditEntity, zipPath: string) {
        try  {
            await crawlerMap.get(audit.id)?.teardown();
        } finally {
            await auditRepository.delete(audit.id);
            crawlerMap.delete(audit.id);
            deleteFileIfExists(zipPath);
        }
    }

    return {
        run: async (auditId) => {
            const audit = await auditRepository.findOrFail(auditId);

            if (! audit.status.is('waiting')) {
                return;
            }

            const crawler = createPlaywrightCrawler({
                auditId,
                eventPublisher,
                artifactDirectory,
                options: audit.options
            });

            crawlerMap.set(audit.id, crawler);

            try {
                await auditService.startAudit(audit)
                await crawler.run([audit.url]);
                await auditService.completeAudit(audit, crawler);
            } catch (err) {
                console.error(err);
                await auditService.failAudit(audit, err);
            } finally {
                // Regardless of audit status (failed, cancelled, completed) we release
                // the audit artifacts and cleanup everything. NO AUDIT HISTORY HERE!
                const zipPath = await releaseArtifactsAction.run({
                    auditId: audit.id,
                    archiveDirectory,
                    artifactDirectory
                });

                void performAuditCleanup(audit, zipPath);
            }
        }
    }
}
