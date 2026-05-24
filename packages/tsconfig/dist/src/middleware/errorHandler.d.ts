import type { NextFunction, Request, Response } from 'express';
export declare function errorHandler(err: Error, _req: Request, res: Response, next: NextFunction): void;
