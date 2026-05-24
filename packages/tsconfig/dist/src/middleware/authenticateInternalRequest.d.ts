import type { NextFunction, Request, Response } from "express";
export declare function handleInternalRequestAuthentication(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
