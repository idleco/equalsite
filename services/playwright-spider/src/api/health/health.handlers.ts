import { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";

export const showHealth: RequestHandler = asyncHandler(async (
    request: Request,
    response: Response
) => {
    return response.json({
        ok: true,
        cwd: process.cwd()
    });
});
