import type { Request } from "express";
import { isIP } from 'node:net';

interface CrawlerInputs {
    url: string;
    callbackUrl: string;
}

export function parseCrawlerInputs(
    req: Request
): CrawlerInputs {
    const url = new URL(req.body.url);

    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
    }

    if (
        url.hostname === 'localhost' ||
        url.hostname.endsWith('.internal')
    ) {
        throw new Error('Forbidden host');
    }

    if (isIP(url.hostname)) {
        throw new Error('IP addresses forbidden');
    }

    if (!req.query.callback) {
        throw new Error('Callback URL is missing.');
    }

    return {
        url: url.toString(),
        callbackUrl: req.query.callback as string
    };
}
