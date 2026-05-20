import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { crawlQueue } from "../../queue/crawlQueue";

export const showStats: RequestHandler = asyncHandler((
    _request: Request,
    response: Response
) => {
    return response.json({
        size: crawlQueue.size,
        pending: crawlQueue.pending
    });
});
