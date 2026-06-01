import { Router } from "express";
import * as AuditController from '../app/controllers/auditController';

const router: Router = Router();

router.post('/audit', AuditController.CreateAudit);
router.delete('/audit/:auditId', AuditController.CancelAudit);

export default router;
