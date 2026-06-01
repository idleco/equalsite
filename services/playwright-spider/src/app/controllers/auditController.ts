import type { RequestHandler } from "express";
import { createAuditAction as createAuditFactory } from "../../audit/actions/createAudit";
import { auditRepository } from "../adapters/redisAuditRepository";
import * as Config from '../../config';
import { crawlerQueue } from "../services/queue";
import { createCancelAuditAction } from "../../audit/actions/cancelAudit";
import { publishEvent } from "../adapters/redisStreamPublisher";

const {
    artifactDirectory,
    maxRequestsPerCrawl
} = Config.crawler;

type CreateAuditRequest = RequestHandler<
    unknown,
    unknown,
    {
        url: string;
        options?: {
            maxPages: number;
        }
    },
    { callback: string; }
>;

const createAuditAction = createAuditFactory(
    auditRepository,
    Config.secretKey
);

export const CreateAudit: CreateAuditRequest = async (
    request,
    response
) => {
    const url = request.body.url;
    const options = request.body.options;
    const urlCallback = request.query.callback;

    console.log('Create audit request', { url, options, urlCallback });

    if (!url || typeof url !== 'string') {
        return response.status(400).json({
            error: 'Invalid request body',
            message: 'JSON body with a string "url" field is required',
        });
    }

    if (!urlCallback || typeof urlCallback !== 'string') {
        return response.status(400).json({
            error: 'Invalid query',
            message: 'A "callback" query parameter is required',
        });
    }

    const maxPages = options?.maxPages || maxRequestsPerCrawl;

    const auditId = await createAuditAction.run({
        url,
        urlCallback,
        options: { maxPages }
    });

    const job = await crawlerQueue.add('audit', { auditId }, { jobId: auditId });

    console.log('accepted', job.id);

    return response.status(202).json({
        accepted: true,
        auditId,
        url,
        options,
    });
}

type CancelAuditRequest = RequestHandler<
    { auditId: string; }
>;

const cancelAuditAction = createCancelAuditAction(
    auditRepository,
    publishEvent,
    artifactDirectory
);

export const CancelAudit: CancelAuditRequest = async (
    request,
    response
) => {
    const auditId = request.params.auditId;

    await cancelAuditAction.run(auditId)

    const job = await crawlerQueue.getJob(auditId);
    const state = await job?.getState();
    if (
        state === 'waiting' ||
        state === 'delayed'
    ) {
        await job?.remove();
    }

    return response.json({
        cancelled: true,
        auditId,
    });
}
