import { Router } from "express";
import * as Config from '../config';
import * as AuditController from '../app/controllers/auditController';

const router: Router = Router();

router.post('/audit', AuditController.CreateAudit);
router.delete('/audit/:auditId', AuditController.CancelAudit);
router.get('/ping', (req, res) => {
    console.log(Config);
    res.json({ ok: true });
});

export default router;
