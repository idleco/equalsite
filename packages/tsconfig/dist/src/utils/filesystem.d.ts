export declare function deleteDirectoryIfExists(dir: string): Promise<void>;
export declare function zipArtifacts(crawlId: string): Promise<string>;
export declare function ensureDirectoryExistence(targetPath: string): void;
export declare function zipDirectory(sourceDir: string, outputZip: string): Promise<{
    path: string;
}>;
