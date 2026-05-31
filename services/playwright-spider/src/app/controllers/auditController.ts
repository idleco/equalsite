import type { RequestHandler } from "express";
import { createAuditAction as createAuditFactory } from "../../audit/actions/createAudit";
import { auditRepository } from "../adapters/redisAuditRepository";
import * as Config from '../../config';
import { crawlerQueue } from "../services/queue";
import { createCancelAuditAction } from "../../audit/actions/cancelAudit";
import { publishEvent } from "../adapters/redisStreamPublisher";

export interface CancelAuditParams { auditId: string; }
export interface CreateAuditQuery { callback: string; }
export interface CreateAuditBody {
    url: string;
    options?: { maxPages: number; }
}

const createAuditAction = createAuditFactory(
    auditRepository,
    Config.secretKey
);

const cancelAuditAction = createCancelAuditAction(
    auditRepository,
    publishEvent,
    Config.crawler.artifactDirectory
)

export const CreateAudit: RequestHandler<
    unknown,
    unknown,
    CreateAuditBody,
    CreateAuditQuery
> = async (req, res) => {
    const { url, options } = req.body;
    const { callback: urlCallback } = req.query;

    const maxPages = options?.maxPages || Config.crawler.maxRequestsPerCrawl;

    const auditId = await createAuditAction.run({
        url,
        urlCallback,
        options: { maxPages }
    });

    await crawlerQueue.add('audit', { auditId }, { jobId: auditId });

    return res.status(202).json({
        accepted: true,
        auditId,
    });
}

export const CancelAudit: RequestHandler<CancelAuditParams> = async (req, res) => {
    const auditId = req.params.auditId;

    await cancelAuditAction.run(auditId);

    const job = await crawlerQueue.getJob(auditId);
    const state = await job?.getState();
    if (
        state === 'waiting' ||
        state === 'delayed'
    ) {
        await job?.remove();
    }

    return res.json({
        cancelled: true,
        auditId,
    });
}
