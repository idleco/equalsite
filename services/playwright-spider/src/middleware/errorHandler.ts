import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction
) {
    if (res.headersSent) {
      return next(err);
    }
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof err.status === "number"
        ? err.status
        : 500;
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Internal Server Error";
    res.status(status).json({ error: message });
  }
