import { Router } from "express";
import * as handlers from './crawlerHandlers'
import { handleInternalRequestAuthentication } from "../../middleware/authenticateInternalRequest";

const router: Router = Router();

router.post(
    '/crawler',
    handleInternalRequestAuthentication,
    handlers.postCrawl
);

router.get(
    '/crawler/:id',
    handleInternalRequestAuthentication,
    handlers.showCrawlState
)

router.delete(
    '/crawler/:id/cancel',
    handleInternalRequestAuthentication,
    handlers.cancelCrawl
)

export default router
