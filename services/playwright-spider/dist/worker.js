import {
  auditRepository,
  bullClient,
  bullmq,
  crawler,
  crawlerMap,
  createAuditService,
  deleteDirectoryIfExists,
  deleteFileIfExists,
  publishEvent,
  secretKey,
  zipDirectory
} from "./chunk-2XOCD232.js";

// src/worker.ts
import { Worker } from "bullmq";

// src/audit/actions/crawlerFactory.ts
import path from "path";
import { Configuration, EnqueueStrategy, PlaywrightCrawler } from "crawlee";
import { AxeBuilder } from "@axe-core/playwright";

// src/audit/events/pageCompletedEvent.ts
import { EventEnum } from "@equalsite/types";
var pageCompletedEvent = (payload) => ({
  type: EventEnum.PageCompleted,
  payload
});

// src/audit/actions/processAxeResult.ts
var createProcessAxeResultAction = (pushData, eventPublisher) => ({
  run: async ({
    auditId,
    pageUrl,
    axeResults
  }) => {
    const accessibilityViolations = axeResults.violations;
    await pushData({
      auditId,
      pageUrl,
      accessibilityViolations
    });
    const severityBreakdown = accessibilityViolations.reduce(
      (prev, curr) => {
        if (curr.impact) {
          prev[curr.impact] = prev[curr.impact] + 1;
        }
        return prev;
      },
      {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0
      }
    );
    await eventPublisher(pageCompletedEvent({
      auditId,
      pageUrl,
      severityBreakdown,
      accessibilityViolationsCount: accessibilityViolations.length
    }));
  }
});

// src/audit/events/pageFailedEvent.ts
import { EventEnum as EventEnum2 } from "@equalsite/types";
var pageFailedEvent = (payload) => ({
  type: EventEnum2.PageFailed,
  payload
});

// src/audit/events/pageStartedEvent.ts
import { EventEnum as EventEnum3 } from "@equalsite/types";
var pageStartedEvent = (payload) => ({
  type: EventEnum3.PageStarted,
  payload
});

// src/audit/actions/crawlerFactory.ts
function createPlaywrightCrawler({
  auditId,
  eventPublisher,
  artifactDirectory,
  options
}) {
  const storageDir = path.join(artifactDirectory, String(auditId));
  const config = new Configuration({
    purgeOnStart: false,
    storageClientOptions: {
      localDataDirectory: storageDir
    }
  });
  const failedRequestHandler = async ({ request }, error) => {
    await eventPublisher(pageFailedEvent({
      auditId,
      pageUrl: request.url,
      attemptsCount: request.retryCount,
      errorMessage: error.message
    }));
  };
  const requestHandler = async ({
    request,
    page,
    pushData,
    enqueueLinks
  }) => {
    const processAxeResultAction = createProcessAxeResultAction(pushData, eventPublisher);
    console.log("Crawlee page started", {
      auditId,
      pageUrl: request.url,
      attemptsCount: request.retryCount
    });
    await eventPublisher(pageStartedEvent({
      auditId,
      pageUrl: request.url,
      attemptsCount: request.retryCount
    }));
    const axeResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
    await processAxeResultAction.run({
      pageUrl: request.url,
      auditId,
      axeResults
    });
    await enqueueLinks({
      strategy: EnqueueStrategy.SameDomain,
      selector: "a"
    });
  };
  return new PlaywrightCrawler(
    {
      failedRequestHandler,
      requestHandler,
      minConcurrency: 1,
      maxConcurrency: 2,
      maxRequestsPerCrawl: options.maxPages,
      maxRequestRetries: 2,
      requestHandlerTimeoutSecs: 120,
      navigationTimeoutSecs: 45,
      headless: true,
      useSessionPool: true,
      persistCookiesPerSession: false,
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
      launchContext: {
        launchOptions: {
          args: [
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-setuid-sandbox"
          ]
        }
      },
      preNavigationHooks: [
        // Resource Blocking
        async ({ page }) => {
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
        }
      ]
    },
    config
  );
}

// src/audit/actions/releaseArtifacts.ts
import fs from "fs";
import path2 from "path";
var createReleaseArtifactsAction = (auditRepository2, secretKey2) => ({
  run: async ({
    auditId,
    artifactDirectory,
    archiveDirectory
  }) => {
    const audit = await auditRepository2.findOrFail(auditId);
    const zipPath = await extractAndCompressArtifacts(audit, archiveDirectory, artifactDirectory);
    try {
      await sendHttpRequest(audit, zipPath, secretKey2);
    } catch (err) {
      console.error(err);
    } finally {
      return zipPath;
    }
  }
});
async function sendHttpRequest(audit, zipPath, secretKey2) {
  const form = new FormData();
  form.append("auditId", audit.id);
  form.append("artifact", new Blob([fs.readFileSync(zipPath)]), `${audit.id}.zip`);
  const response = await fetch(audit.urlCallback, {
    method: "POST",
    headers: { "Authorization": `Bearer ${secretKey2}` },
    body: form
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
async function extractAndCompressArtifacts(audit, artifactDirectory, archiveDirectory) {
  const sourceDir = path2.join(artifactDirectory, audit.id);
  const zipPath = path2.join(archiveDirectory, `${audit.id}.zip`);
  const result = await zipDirectory(sourceDir, zipPath);
  await deleteDirectoryIfExists(sourceDir);
  return result.path;
}

// src/audit/actions/runAudit.ts
var createRunAuditAction = (auditRepository2, eventPublisher, config) => {
  const {
    artifactDirectory,
    archiveDirectory,
    secretKey: secretKey2
  } = config;
  const auditService = createAuditService(auditRepository2, eventPublisher);
  const releaseArtifactsAction = createReleaseArtifactsAction(auditRepository2, secretKey2);
  async function performAuditCleanup(audit, zipPath) {
    try {
      await crawlerMap.get(audit.id)?.teardown();
      await deleteFileIfExists(zipPath);
    } finally {
      await auditRepository2.delete(audit.id);
      crawlerMap.delete(audit.id);
    }
  }
  return {
    run: async (auditId) => {
      const audit = await auditRepository2.findOrFail(auditId);
      if (!audit.status.is("waiting")) {
        return;
      }
      const crawler2 = createPlaywrightCrawler({
        auditId,
        eventPublisher,
        artifactDirectory,
        options: audit.options
      });
      crawlerMap.set(audit.id, crawler2);
      try {
        await auditService.startAudit(audit);
        await crawler2.run([audit.url]);
        await auditService.completeAudit(audit, crawler2);
      } catch (err) {
        console.error(err);
        await auditService.failAudit(audit, err);
      } finally {
        const zipPath = await releaseArtifactsAction.run({
          auditId: audit.id,
          archiveDirectory,
          artifactDirectory
        });
        void performAuditCleanup(audit, zipPath);
      }
    }
  };
};

// src/worker.ts
var crawlerWorker = new Worker(
  bullmq.queue,
  async (job) => {
    await createRunAuditAction(
      auditRepository,
      publishEvent,
      {
        artifactDirectory: crawler.artifactDirectory,
        archiveDirectory: crawler.archiveDirectory,
        secretKey
      }
    ).run(job.data.auditId);
  },
  {
    connection: bullClient,
    concurrency: bullmq.concurrency
  }
);
crawlerWorker.on("active", (job) => {
  console.error("Crawler worker active", { jobId: job.id });
});
crawlerWorker.on("error", (error) => {
  console.error("Crawler worker error", error);
});
crawlerWorker.on("ready", () => {
  console.log("Crawler worker ready");
});
