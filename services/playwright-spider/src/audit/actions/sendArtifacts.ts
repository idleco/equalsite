import fs from 'node:fs';
import path from 'node:path';
import type { AuditRepository } from '../repositories/auditRepository';
import type AuditEntity from '../entities/audit';
import { deleteDirectoryIfExists, deleteFileIfExists, zipDirectory } from '../utils/fsDirectory';

export interface ISendArtifactsAction {
    run: (params: {
        auditId: string;
        artifactDirectory: string;
        archiveDirectory: string;
    }) =>  Promise<void>;
}

export const createSendArtifactsAction = (
    auditRepository: AuditRepository,
    secretKey: string
): ISendArtifactsAction => ({
    run: async ({
        auditId,
        artifactDirectory,
        archiveDirectory
    }) => {
        const audit = await auditRepository.findOrFail(auditId);

        const zipPath = await extractArtifacts({
            audit,
            archiveDirectory,
            artifactDirectory
        });

        const form = new FormData();
        form.append('auditId', auditId);
        form.append(
            'artifact',
            new Blob([fs.readFileSync(zipPath)]),
            `${auditId}.zip`,
        );

        const response = await fetch(audit.urlCallback, {
            method: 'POST',
            headers: { 'Authorization':  `Bearer ${secretKey}`},
            body: form,
        });

        if (! response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        deleteFileIfExists(zipPath);
    }
});

async function extractArtifacts({
    audit,
    archiveDirectory,
    artifactDirectory
}: {
    audit: AuditEntity;
    artifactDirectory: string;
    archiveDirectory: string;
}): Promise<string> {
    const sourceDir = path.join(artifactDirectory, audit.id);
    const zipPath = path.join(archiveDirectory, `${audit.id}.zip`);

    const result = await zipDirectory(sourceDir, zipPath);

    // Delete the source folder after zip
    await deleteDirectoryIfExists(sourceDir);

    return result.path;
}
