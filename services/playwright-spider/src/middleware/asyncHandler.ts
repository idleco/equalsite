import type { NextFunction, Request, RequestHandler, Response } from 'express'

export function asyncHandler<Req extends Request = Request>(
    fn: (req: Req, res: Response, next: NextFunction) => unknown,
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req as Req, res, next)).catch(next)
    }
}
