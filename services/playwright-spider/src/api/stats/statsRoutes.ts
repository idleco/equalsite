import { Router } from "express";
import { handleInternalRequestAuthentication } from "../../middleware/authenticateInternalRequest";
import * as handlers from './statsHandlers'

const router: Router = Router();

router.get(
    "/queue/stats",
    handleInternalRequestAuthentication,
    handlers.showStats
);

export default router;
