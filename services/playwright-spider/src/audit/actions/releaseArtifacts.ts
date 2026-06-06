import fs from 'node:fs';
import path from 'node:path';
import type { AuditRepository } from '../repositories/auditRepository';
import type AuditEntity from '../entities/audit';
import { deleteDirectoryIfExists, deleteFileIfExists, zipDirectory } from '../utils/fsDirectory';
import { crawlerMap } from '../services/crawlerMap';

export interface IReleaseArtifactsAction {
    run: (auditId: string) =>  Promise<void>;
}

export const createReleaseArtifactsAction = (
    auditRepository: AuditRepository,
    artifactDirectory: string,
    archiveDirectory: string,
    secretKey: string
): IReleaseArtifactsAction => {
    async function performAuditCleanup(audit: AuditEntity, zipPath: string) {
        console.log('Performing audit cleanup...');
        try  {
            await crawlerMap.get(audit.id)?.teardown();
            crawlerMap.delete(audit.id);
            await auditRepository.delete(audit.id);
            // deleteFileIfExists(zipPath);
            console.log('Cleanup successfully!');
        } catch (err) {
            console.log('Clean up failed: ', err);
        }
    }
    return {
        run: async (auditId) => {
            const audit = await auditRepository.findOrFail(auditId);
            const zipPath = await extractAndCompressArtifacts(audit, artifactDirectory, archiveDirectory);
            console.log(`Releasing audit (${auditId}) artifacts...`);
            try {
                await sendHttpRequest(audit, zipPath, secretKey);
                console.log(`Audit ${auditId} artifacts sent!`);
            } catch (err) {
                console.error('Audit artifacts could\'nt release: ', err);
            } finally {
                // Regardless of what http response could be,
                // we return the zipPath here for audit clean up later.
                await performAuditCleanup(audit, zipPath);
            }
        }
    }
}



async function sendHttpRequest(
    audit: AuditEntity,
    zipPath: string,
    secretKey: string
) {
    const form = new FormData();
    form.append('auditId', audit.id);
    form.append('artifact', new Blob([fs.readFileSync(zipPath)]), `${audit.id}.zip`);

    const response = await fetch(audit.urlCallback, {
        method: 'POST',
        headers: { 'Authorization':  `Bearer ${secretKey}`},
        body: form,
    });

    if (! response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

async function extractAndCompressArtifacts(
    audit: AuditEntity,
    artifactDirectory: string,
    archiveDirectory: string
): Promise<string> {
    const sourceDir = path.join(artifactDirectory, audit.id);
    const zipPath = path.join(archiveDirectory, `${audit.id}.zip`);

    console.log(`Extracting artifacts (${sourceDir}) to (${zipPath})`);

    const result = await zipDirectory(sourceDir, zipPath);

    // Delete the source folder after zip
    await deleteDirectoryIfExists(sourceDir);

    return result.path;
}
