import {
  ARTIFACTS_DIRECTORY,
  AUTH_HEADER,
  activeCrawlers,
  cancelledCrawls,
  crawlQueue,
  deleteDirectoryIfExists,
  publishQueuePositions
} from "./chunk-GUOYCV3H.js";

// src/routes.ts
import express from "express";

// src/middleware/errorHandler.ts
function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status = typeof err === "object" && err !== null && "status" in err && typeof err.status === "number" ? err.status : 500;
  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Internal Server Error";
  res.status(status).json({ error: message });
}

// src/api/crawler/crawlerRoutes.ts
import { Router } from "express";

// src/middleware/asyncHandler.ts
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// src/api/crawler/crawlerHandlers.ts
import { randomUUID } from "crypto";

// src/api/crawler/validation.ts
async function urlIsReachable(url, options) {
  const response = await fetch(url, {
    method: "POST",
    headers: { ...options.headers }
  });
  return Boolean(response.ok);
}
async function ensureCallbackUrlReachable(callbackUrl) {
  const isValid = await urlIsReachable(callbackUrl, {
    headers: AUTH_HEADER
  });
  if (!isValid) {
    throw new Error("Callback url is unreachable");
  }
}

// src/api/crawler/crawlerHandlers.ts
import path from "path";
var postCrawl = asyncHandler(async (request, response) => {
  const url = request.body.url;
  const callbackUrl = request.query.callback;
  try {
    await ensureCallbackUrlReachable(callbackUrl);
  } catch {
    return response.status(403).json({
      error: "The callback url is unreachable."
    });
  }
  const crawlId = randomUUID();
  const job = await crawlQueue.add(
    "audit",
    {
      crawlId,
      url,
      callbackUrl
    },
    {
      jobId: crawlId
    }
  );
  await publishQueuePositions();
  return response.status(202).json({
    accepted: true,
    crawlId: job.id
  });
});
var showCrawlState = asyncHandler(async (request, response) => {
  const crawlId = request.params.id;
  const job = await crawlQueue.getJob(crawlId);
  if (!job) {
    return response.status(404).json({
      error: "Job not found."
    });
  }
  const state = await job.getState();
  const waiting = await crawlQueue.getWaiting();
  const position = waiting.findIndex((i) => i.id === job.id);
  return response.json({
    crawlId,
    state,
    position,
    waiting: waiting.length,
    progress: job.progress
  });
});
var cancelCrawl = asyncHandler(async (request, response) => {
  const crawlId = request.params.id;
  cancelledCrawls.add(crawlId);
  const job = await crawlQueue.getJob(crawlId);
  const state = await job?.getState();
  if (state === "waiting" || state === "delayed") {
    await job?.remove();
  }
  const active = activeCrawlers.get(crawlId);
  if (active) {
    try {
      await active.crawler.teardown();
    } catch (error) {
      console.error("Crawler teardown failed", error);
    } finally {
      activeCrawlers.delete(crawlId);
    }
  }
  try {
    await deleteDirectoryIfExists(
      path.join(ARTIFACTS_DIRECTORY, crawlId)
    );
  } catch (err) {
    console.error("Crawler cleanup failed", err);
  }
  return response.json({
    cancelled: true,
    crawlId,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});

// src/middleware/authenticateInternalRequest.ts
function handleInternalRequestAuthentication(req, res, next) {
  const authToken = req.headers.authorization;
  if (!authToken?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }
  const token = authToken.replace("Bearer ", "");
  if (token !== process.env.CRAWLER_SECRET) {
    return res.status(403).json({
      error: "Forbidden"
    });
  }
  next();
}

// src/api/crawler/crawlerRoutes.ts
var router = Router();
router.post(
  "/crawler",
  handleInternalRequestAuthentication,
  postCrawl
);
router.get(
  "/crawler/:id",
  handleInternalRequestAuthentication,
  showCrawlState
);
router.delete(
  "/crawler/:id/cancel",
  handleInternalRequestAuthentication,
  cancelCrawl
);
var crawlerRoutes_default = router;

// src/api/health/healthRoutes.ts
import { Router as Router2 } from "express";

// src/api/health/healthHandlers.ts
var showHealth = asyncHandler((_request, response) => {
  return response.json({
    ok: true
  });
});

// src/api/health/healthRoutes.ts
var router2 = Router2();
router2.get(
  "/health",
  handleInternalRequestAuthentication,
  showHealth
);
var healthRoutes_default = router2;

// src/routes.ts
var app = express();
app.use(express.json());
app.use(healthRoutes_default);
app.use(crawlerRoutes_default);
app.use(errorHandler);
var routes_default = app;

// src/server.ts
var HOST = "0.0.0.0";
var PORT = Number(process.env.CRAWLER_PORT) || 3e3;
routes_default.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
