import type { NextFunction, Request, Response } from "express";

export function handleInternalRequestAuthentication(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authToken = req.headers.authorization;

    if (!authToken?.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    const token = authToken.replace('Bearer ', '');

    if (token !== process.env.CRAWLER_SECRET) {
        return res.status(403).json({
            error: 'Forbidden'
        });
    }

    next();
}
