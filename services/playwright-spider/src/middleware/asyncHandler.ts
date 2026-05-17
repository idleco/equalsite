import type { Request, Response, NextFunction, RequestHandler } from 'express'

export function asyncHandler<Req extends Request = Request>(
    fn: (req: Req, res: Response, next: NextFunction) => any,
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req as Req, res, next)).catch(next)
    }
}
