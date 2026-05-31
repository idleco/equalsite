import type { AuditRepository } from "../repositories/auditRepository";
import createPlaywrightCrawler from "./crawlerFactory";
import type { EventPublisher } from "../repositories/eventPublisher";
import { createSendArtifactsAction } from "./sendArtifacts";
import { failedEvent } from "../events/failedEvent";
import { completedEvent } from "../events/completedEvent";
import { startedEvent } from "../events/startedEvent";
import { crawlerMap } from "../services/crawlerMap";

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
    const sendArtifactsAction = createSendArtifactsAction(auditRepository, secretKey);
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
                await auditRepository.save(audit.markAsActive());
                await eventPublisher(startedEvent({
                    auditId: audit.id
                }));

                await Promise.allSettled([
                    crawler.run([audit.url]),
                    sendArtifactsAction.run({
                        auditId: audit.id,
                        archiveDirectory,
                        artifactDirectory
                    }),
                ]);

                await auditRepository.save(audit.markAsCompleted());
                await eventPublisher(completedEvent({
                    auditId: audit.id,
                    statistics: crawler.stats.state
                }));
            } catch (err) {
                console.error(err);
                const error = typeof err === 'string' ? err : (err as Error).message;
                await auditRepository.save(audit.markAsFailed(error));
                await eventPublisher(failedEvent({
                    auditId: audit.id,
                    error
                }));
            } finally {
                // Clean-up
                await crawler.teardown();
                await auditRepository.delete(audit.id);
                crawlerMap.delete(audit.id);
            }
        }
    }
}
