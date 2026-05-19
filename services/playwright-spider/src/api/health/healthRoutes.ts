import { Router } from "express";
import { handleInternalRequestAuthentication } from "../../middleware/authenticateInternalRequest";
import * as handlers from './healthHandlers'

const router: Router = Router();

router.get(
    "/health",
    handleInternalRequestAuthentication,
    handlers.showHealth
);

export default router;
