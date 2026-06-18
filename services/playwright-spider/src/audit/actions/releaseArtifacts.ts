import fs from 'node:fs';
import path from 'node:path';
import type { AuditRepository } from '../repositories/auditRepository';
import type AuditEntity from '../entities/audit';
import { deleteDirectoryIfExists, zipDirectory } from '../utils/fsDirectory';

export interface IReleaseArtifactsAction {
    run: (auditId: string) =>  Promise<string>;
}

export const createReleaseArtifactsAction = (
    auditRepository: AuditRepository,
    artifactDirectory: string,
    archiveDirectory: string,
    secretKey: string
): IReleaseArtifactsAction => {
    return {
        run: async (auditId) => {
            const audit = await auditRepository.findOrFail(auditId);
            const zipPath = await extractAndCompressArtifacts(audit, artifactDirectory, archiveDirectory);

            try {
                await sendHttpRequest(audit, zipPath, secretKey);
                console.log(`Audit ${auditId} artifacts sent!`);
            } catch (err) {
                console.error('Audit artifacts could\'nt release: ', err);
            }

            return zipPath;
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
