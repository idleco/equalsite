import type { Request, Response } from "express";
import { createAuditAction as createAuditFactory } from "../../audit/actions/createAudit";
import { auditRepository } from "../adapters/redisAuditRepository";
import * as Config from '../../config';
import { crawlerQueue } from "../services/queue";
import { createCancelAuditAction } from "../../audit/actions/cancelAudit";
import { publishEvent } from "../adapters/redisStreamPublisher";
import type { CancelAuditRequestParams, CancelAuditResponseData, CreateAuditRequestBody, CreateAuditResponseData } from "@equalsite/types";

const {
    artifactDirectory,
} = Config.crawler;

const createAuditAction = createAuditFactory(auditRepository, Config.secretKey);

export const CreateAudit = async (
    request: Request<unknown, unknown, CreateAuditRequestBody>,
    response: Response<CreateAuditResponseData>
) => {
    const urls = request.body.urls;
    const options = request.body.options;
    const urlCallback = request.body.callbackUrl;

    if (!urls || ! Array.isArray(urls)) {
        return response.status(400).json({
            error: 'Invalid request body',
            message: 'JSON body with a array of string "url" field is required',
        });
    }

    if (!urlCallback || typeof urlCallback !== 'string') {
        return response.status(400).json({
            error: 'Invalid query',
            message: 'A "callback" query parameter is required',
        });
    }

    const auditId = await createAuditAction.run({
        urls,
        urlCallback,
        options
    });

    await crawlerQueue.add('audit', { auditId }, { jobId: auditId });

    return response.status(202).json({
        id: auditId,
        options,
    });
}

const cancelAuditAction = createCancelAuditAction(
    auditRepository,
    publishEvent,
    artifactDirectory
);

export const CancelAudit = async (
    request: Request<CancelAuditRequestParams>,
    response: Response<CancelAuditResponseData>
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
        auditId,
    });
}
