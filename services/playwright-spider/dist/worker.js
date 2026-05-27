import {
  ARTIFACTS_DIRECTORY,
  AUTH_HEADER,
  CONCURRENCY,
  QUEUE_NAME,
  activeCrawlers,
  bullMqRedis,
  cancelledCrawls,
  crawlQueue,
  publishEvent,
  publishQueuePositions,
  zipArtifacts
} from "./chunk-GUOYCV3H.js";

// src/queue/crawlWorker.ts
import { Worker } from "bullmq";

// src/crawler/createCrawler.ts
import path from "path";
import { Configuration, EnqueueStrategy, PlaywrightCrawler } from "crawlee";
import { AxeBuilder } from "@axe-core/playwright";

// src/crawler/resourceBlocking.ts
function setupResourceBlocking() {
  return async ({ page }) => {
    await page.route("**/*", async (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      if ([
        "media",
        "font",
        "websocket",
        "manifest",
        "stylesheet"
      ].includes(resourceType)) {
        return await route.abort();
      }
      const url = request.url();
      if (url.includes("google-analytics") || url.includes("doubleclick") || url.includes("hotjar")) {
        return await route.abort();
      }
      return await route.continue();
    });
  };
}

// src/events/throttleAsync.ts
var lastExecution = /* @__PURE__ */ new Map();
async function throttleAsync(key, callback, delay = 1e3) {
  const now = Date.now();
  const previous = lastExecution.get(key);
  if (previous && now - previous < delay) {
    return;
  }
  lastExecution.set(key, now);
  await callback();
}

// src/events/publishAuditProgress.ts
var THROTTLE_DELAY = 1e3;
async function publishAuditProgress(options) {
  const {
    crawlId,
    pagesCompleted,
    pagesTotal,
    currentUrl,
    violations
  } = options;
  await throttleAsync(
    `audit-progress:${crawlId}`,
    async () => {
      const progress = pagesTotal === 0 ? 0 : Math.round(
        pagesCompleted / pagesTotal * 100
      );
      await publishEvent({
        type: "audit.progress",
        payload: {
          crawlId,
          pagesCompleted,
          pagesTotal,
          currentUrl,
          violations,
          progress
        }
      });
    },
    THROTTLE_DELAY
  );
}

// src/crawler/createCrawler.ts
var crawlerOptions = {
  /** Concurrency */
  minConcurrency: 1,
  maxConcurrency: 2,
  maxRequestsPerCrawl: 10,
  /** Retry behavior */
  maxRequestRetries: 2,
  requestHandlerTimeoutSecs: 120,
  navigationTimeoutSecs: 45,
  /** Browser */
  headless: true,
  /** Session management */
  useSessionPool: true,
  persistCookiesPerSession: false,
  /** Resource control */
  autoscaledPoolOptions: {
    desiredConcurrency: 2,
    maxConcurrency: 2,
    autoscaleIntervalSecs: 10,
    maybeRunIntervalSecs: 1,
    loggingIntervalSecs: 30,
    taskTimeoutSecs: 180,
    snapshotterOptions: {
      maxUsedMemoryRatio: 0.75
    }
  },
  /** Browser launch */
  launchContext: {
    launchOptions: {
      args: [
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    }
  }
};
function createCrawler(crawlId) {
  const storageDir = path.join(
    ARTIFACTS_DIRECTORY,
    String(crawlId)
  );
  const config = new Configuration({
    purgeOnStart: false,
    storageClientOptions: {
      localDataDirectory: storageDir
    }
  });
  const options = {
    ...crawlerOptions,
    preNavigationHooks: [
      setupResourceBlocking()
    ],
    // failedRequestHandler,
    /** Main handler */
    async requestHandler({
      page,
      request,
      enqueueLinks,
      pushData,
      crawler
    }) {
      const url = request.url;
      const axeResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
      await pushData({
        crawlId,
        url,
        violations: axeResults.violations
      });
      await enqueueLinks({
        strategy: EnqueueStrategy.SameHostname,
        selector: "a"
      });
      const requestQueue = await crawler.getRequestQueue();
      const requestQueueInfo = await requestQueue.getInfo();
      await publishAuditProgress({
        crawlId,
        currentUrl: url,
        pagesTotal: requestQueueInfo?.totalRequestCount || 0,
        pagesCompleted: requestQueueInfo?.handledRequestCount || 0,
        violations: axeResults.violations.length
      });
    }
  };
  return new PlaywrightCrawler(options, config);
}

// src/crawler/auditJob.ts
import fs from "fs";
async function runAuditJob(job) {
  const { crawlId, url, callbackUrl } = job.data;
  const crawler = createCrawler(crawlId);
  activeCrawlers.set(crawlId, {
    crawler,
    crawlId,
    startingUrl: url,
    startedAt: /* @__PURE__ */ new Date()
  });
  if (cancelledCrawls.has(crawlId)) {
    return;
  }
  try {
    await crawler.run([url]);
    const zippedArtifactsPath = await zipArtifacts(crawlId);
    await callbackWithArtifacts({
      zippedArtifactsPath,
      crawlId,
      callbackUrl
    });
  } finally {
    activeCrawlers.delete(crawlId);
    cancelledCrawls.delete(crawlId);
  }
}
async function callbackWithArtifacts({
  crawlId,
  callbackUrl,
  zippedArtifactsPath
}) {
  const form = new FormData();
  form.append("crawlId", crawlId);
  form.append(
    "artifact",
    new Blob([fs.readFileSync(zippedArtifactsPath)]),
    `${crawlId}.zip`
  );
  return await fetch(callbackUrl, {
    method: "POST",
    headers: { ...AUTH_HEADER },
    body: form
  });
}

// src/queue/crawlWorker.ts
var crawlWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    await publishEvent({
      type: "audit.started",
      payload: {
        crawlId: job.id
      }
    });
    await publishQueuePositions();
    await runAuditJob(job);
  },
  {
    connection: bullMqRedis,
    concurrency: CONCURRENCY
  }
);
crawlWorker.on("completed", async (job) => {
  await publishEvent({
    type: "audit.completed",
    payload: {
      crawlId: job.id
    }
  });
  await publishQueuePositions();
});
crawlWorker.on("failed", async (job, error) => {
  await publishEvent({
    type: "audit.failed",
    payload: {
      crawlId: job?.id,
      error: error.message
    }
  });
  await publishQueuePositions();
});

// src/events/publishTelemetry.ts
import os from "os";
import process2 from "process";
var THROTTLE_DELAY2 = 5e3;
async function publishTelemetry() {
  await throttleAsync(
    "crawler-telemetry",
    async () => {
      const memory = process2.memoryUsage();
      await publishEvent({
        type: "crawler.telemetry",
        payload: {
          process: {
            pid: process2.pid,
            uptime: process2.uptime(),
            memory: {
              rss: memory.rss,
              heapUsed: memory.heapUsed,
              heapTotal: memory.heapTotal
            }
          },
          system: {
            loadAverage: os.loadavg(),
            freeMemory: os.freemem(),
            totalMemory: os.totalmem()
          },
          queue: {
            waiting: await crawlQueue.getWaitingCount(),
            active: await crawlQueue.getActiveCount()
          },
          crawlers: {
            active: activeCrawlers.size
          }
        }
      });
    },
    THROTTLE_DELAY2
  );
}

// src/events/startTelemetryLoop.ts
var started = false;
var interval;
function startTelemetryLoop() {
  if (started) {
    return;
  }
  started = true;
  interval = setInterval(async () => {
    try {
      await publishTelemetry();
    } catch (error) {
      console.error(
        "Telemetry publish failed",
        error
      );
    }
  }, 1e3);
}
function stopTelemetryLoop() {
  clearInterval(interval);
}

// src/worker.ts
startTelemetryLoop();
process.on(
  "SIGTERM",
  () => {
    stopTelemetryLoop();
    process.exit(0);
  }
);
