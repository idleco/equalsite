import {
  auditRepository,
  bullClient,
  bullmq,
  config_exports,
  crawler,
  crawlerMap,
  createAuditService,
  deleteDirectoryIfExists,
  publishEvent,
  secretKey
} from "./chunk-NXGFBMWD.js";

// src/app.ts
import express from "express";

// src/routes/index.ts
import { Router } from "express";

// src/audit/actions/createAudit.ts
var createAuditAction = (auditRepository2, secretKey2) => ({
  run: async ({
    url,
    urlCallback,
    options
  }) => {
    await validateCallbackUrl(urlCallback, secretKey2);
    const audit = await auditRepository2.create({
      url,
      urlCallback,
      options
    });
    return audit.id;
  }
});
function assertCallbackIsNotAuditEndpoint(urlCallback) {
  let parsed;
  try {
    parsed = new URL(urlCallback);
  } catch {
    throw new Error(`Invalid callback URL [${urlCallback}].`);
  }
  if (parsed.pathname.endsWith("/audit")) {
    throw new Error(
      `Callback URL [${urlCallback}] must not point to the audit API endpoint.`
    );
  }
}
async function validateCallbackUrl(urlCallback, secretKey2) {
  assertCallbackIsNotAuditEndpoint(urlCallback);
  const response = await fetch(urlCallback, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey2}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ probe: true })
  });
  if (!response.ok) {
    throw new Error(`Callback URL [${urlCallback}] is unreachable.`);
  }
}

// src/app/services/queue.ts
import { Queue } from "bullmq";
var crawlerQueue = new Queue(
  bullmq.queue,
  {
    connection: bullClient,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 1e3,
      attempts: 1,
      backoff: {
        type: "exponential",
        delay: 5e3
      }
    }
  }
);

// src/audit/actions/cancelAudit.ts
var createCancelAuditAction = (auditRepository2, eventPublisher, artifactDirectory2) => {
  const auditService = createAuditService(auditRepository2, eventPublisher);
  return {
    run: async (auditId) => {
      const audit = await auditRepository2.findOrFail(auditId);
      if (!audit.status.is("active")) {
        return;
      }
      await auditRepository2.save(audit.markAsCancelled());
      try {
        const crawler2 = crawlerMap.get(audit.id);
        if (crawler2) {
          await auditService.cancelAudit(audit, crawler2);
          await crawler2.teardown();
        }
        await deleteDirectoryIfExists(artifactDirectory2);
      } catch (err) {
        console.error(err);
      } finally {
        await auditRepository2.delete(audit.id);
        crawlerMap.delete(audit.id);
      }
    }
  };
};

// src/app/controllers/auditController.ts
var {
  artifactDirectory,
  maxRequestsPerCrawl
} = crawler;
var createAuditAction2 = createAuditAction(
  auditRepository,
  secretKey
);
var CreateAudit = async (request, response) => {
  const siteUrl = request.body.url;
  const options = request.body.options;
  const urlCallback = request.query.callback;
  if (!siteUrl || typeof siteUrl !== "string") {
    return response.status(400).json({
      error: "Invalid request body",
      message: 'JSON body with a string "url" field is required'
    });
  }
  if (!urlCallback || typeof urlCallback !== "string") {
    return response.status(400).json({
      error: "Invalid query",
      message: 'A "callback" query parameter is required'
    });
  }
  const auditId = await createAuditAction2.run({
    url: siteUrl,
    urlCallback,
    options: {
      maxPages: options?.maxPages || maxRequestsPerCrawl
    }
  });
  const auditJob = await crawlerQueue.add("audit", { auditId }, { jobId: auditId });
  return response.status(202).json({
    accepted: true,
    data: {
      auditId: auditJob.id,
      auditRequest: {
        siteUrl,
        options,
        urlCallback
      }
    }
  });
};
var cancelAuditAction = createCancelAuditAction(
  auditRepository,
  publishEvent,
  artifactDirectory
);
var CancelAudit = async (request, response) => {
  const auditId = request.params.auditId;
  await cancelAuditAction.run(auditId);
  const job = await crawlerQueue.getJob(auditId);
  const state = await job?.getState();
  if (state === "waiting" || state === "delayed") {
    await job?.remove();
  }
  return response.json({
    cancelled: true,
    auditId
  });
};

// src/routes/index.ts
var router = Router();
router.post("/audit", CreateAudit);
router.delete("/audit/:auditId", CancelAudit);
router.get("/ping", (req, res) => {
  console.log(config_exports);
  res.json({ ok: true });
});
var routes_default = router;

// src/app/middleware/authenticateInternalRequest.ts
function authenticateInternalRequest() {
  return (request, response, next) => {
    const authToken = request.headers.authorization;
    if (!authToken?.startsWith("Bearer ")) {
      return response.status(401).json({
        error: "Unauthorized"
      });
    }
    const token = authToken.replace("Bearer ", "");
    if (token !== secretKey) {
      return response.status(403).json({
        error: "Forbidden"
      });
    }
    next();
  };
}

// src/app.ts
var app = express();
app.use(express.json());
app.use(authenticateInternalRequest());
app.use("/api/v1", routes_default);
var app_default = app;

// src/server.ts
var HOST = "0.0.0.0";
var PORT = Number(process.env.CRAWLER_PORT) || 3e3;
app_default.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
