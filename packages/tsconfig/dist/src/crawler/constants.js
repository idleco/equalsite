import path from 'node:path';
const STORAGE_PATH = path.join(process.cwd(), 'storage');
const ARTIFACTS_DIRECTORY = path.join(STORAGE_PATH, 'artifacts');
const ARCHIVES_DIRECTORY = path.join(STORAGE_PATH, 'archives');
const AUTH_HEADER = {
    Authorization: `Bearer ${process.env.CRAWLER_SECRET}`
};
export { STORAGE_PATH, ARTIFACTS_DIRECTORY, ARCHIVES_DIRECTORY, AUTH_HEADER };
//# sourceMappingURL=constants.js.map