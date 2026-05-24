export function handleInternalRequestAuthentication(req, res, next) {
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
//# sourceMappingURL=authenticateInternalRequest.js.map