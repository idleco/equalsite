import type AuditEntity from "../entities/audit";
import type { AuditRepository } from "../repositories/auditRepository";
import { crawlerMap } from "../services/crawlerMap";
import { deleteFileIfExists } from "../utils/fsDirectory";

export interface IPerformCleanUpAction {
    run: (audit: AuditEntity, zipPath: string) => Promise<void>;
}

export const createPerformCleanUpAction = (
    auditRepository: AuditRepository,
): IPerformCleanUpAction => ({
    run: async (audit, zipPath) => {
        try  {
            await crawlerMap.get(audit.id)?.teardown();
            crawlerMap.delete(audit.id);
            await auditRepository.delete(audit.id);
            deleteFileIfExists(zipPath);
            console.log('Cleanup successfully!');
        } catch (err) {
            console.log('Clean up failed: ', err);
        }
    }
});
