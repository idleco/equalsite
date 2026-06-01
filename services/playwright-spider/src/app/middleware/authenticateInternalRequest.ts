import type { RequestHandler } from "express";
import { secretKey } from '../../config';

export function authenticateInternalRequest(): RequestHandler {
    return (request, response, next) => {
        const authToken = request.headers.authorization;

        if (!authToken?.startsWith('Bearer ')) {
            return response.status(401).json({
                error: 'Unauthorized'
            });
        }

        const token = authToken.replace('Bearer ', '');

        if (token !== secretKey) {
            return response.status(403).json({
                error: 'Forbidden'
            });
        }

        next();
    }
}
