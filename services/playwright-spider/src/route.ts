import { Router } from "express";
import { authenticateInternalRequest } from "./app/middleware/authenticateInternalRequest";
import * as AuditController from './app/controllers/auditController';

const router: Router = Router();

router.post('/audit', authenticateInternalRequest, AuditController.CreateAudit);
router.delete('/audit/:id', authenticateInternalRequest, AuditController.CancelAudit);

export default router;
