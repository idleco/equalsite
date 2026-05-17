import { Router } from "express";
import * as handlers from './crawler.handlers'
import { handleInternalRequestAuthentication } from "../../middleware/authenticateInternalRequest";

const router: Router = Router();

router.post(
    '/crawler',
    handleInternalRequestAuthentication,
    handlers.postCrawl
);

router.delete(
    '/crawler/:id/cancel',
    handleInternalRequestAuthentication,
    handlers.cancelCrawl
)

export default router
