declare module 'archiver' {
    import type { ZlibOptions } from 'node:zlib';
    import type { Writable } from 'node:stream';

    export interface ZipOptions {
        zlib?: ZlibOptions;
    }

    export class Archiver extends Writable {
        directory(dirpath: string, destpath: false | string): this;
        finalize(): Promise<void>;
        pipe<T extends NodeJS.WritableStream>(destination: T): T;
        on(event: 'error', listener: (err: Error) => void): this;
        on(event: 'close', listener: () => void): this;
    }

    export class ZipArchive extends Archiver {
        constructor(options?: ZipOptions);
    }
}
