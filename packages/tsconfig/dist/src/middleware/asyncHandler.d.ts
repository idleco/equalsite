import type { NextFunction, Request, RequestHandler, Response } from 'express';
export declare function asyncHandler<Req extends Request = Request>(fn: (req: Req, res: Response, next: NextFunction) => unknown): RequestHandler;
