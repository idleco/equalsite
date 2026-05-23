import fs from 'node:fs';
import path from 'node:path';
import { ZipArchive } from 'archiver';
import { ARCHIVES_DIRECTORY, ARTIFACTS_DIRECTORY } from '../crawler/constants';

export async function deleteDirectoryIfExists(
    dir: string
): Promise<void> {
    if (fs.existsSync(dir)) {
        await fs.promises.rm(
            dir,
            {
                recursive: true,
                force: true,
            },
        );
    }
}

export async function zipArtifacts(
    crawlId: string
): Promise<string> {
    const sourceDir = path.join(ARTIFACTS_DIRECTORY, crawlId);
    const zipPath = path.join(ARCHIVES_DIRECTORY, `${crawlId}.zip`);

    const result = await zipDirectory(sourceDir, zipPath);

    // Delete the source folder after zip
    await deleteDirectoryIfExists(sourceDir);

    return result.path;
}

export function ensureDirectoryExistence(
    targetPath: string
): void {
    const dirname = path.dirname(targetPath);
    if (! fs.existsSync(dirname)) {
        ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }
}

export async function zipDirectory(
    sourceDir: string,
    outputZip: string,
): Promise<{ path: string; }> {
    return await new Promise((resolve, reject) => {
        if (fs.existsSync(outputZip)) {
            resolve({ path: outputZip });
        }

        if (! fs.existsSync(sourceDir)) {
            reject('Source directory not exists.');
        }

        ensureDirectoryExistence(outputZip);

        const output = fs.createWriteStream(outputZip);
        const archive = new ZipArchive({
            zlib: { level: 9 },
        });

        output.on('close', () => resolve({
            path: output.path as string
        }));

        archive.on('error', reject);
        archive.pipe(output);
        archive.directory(sourceDir, false);

        void archive.finalize();
    });
}
