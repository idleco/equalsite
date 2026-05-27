// src/lib/redis.ts
import Redis from "ioredis";
var config = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null
};
var redis = new Redis(config);
var bullMqRedis = new Redis(config);

// src/queue/constants.ts
var QUEUE_NAME = "crawl-queue";
var CONCURRENCY = 2;

// src/events/publishEvent.ts
var STREAM_NAME = String(process.env.STREAM_NAME);
var VERSION = "1";
async function publishEvent(event) {
  await redis.xadd(
    STREAM_NAME,
    "MAXLEN",
    "~",
    "10000",
    "*",
    "data",
    JSON.stringify({
      version: VERSION,
      timestamp: Date.now(),
      ...event
    })
  );
}

// src/queue/crawlQueue.ts
import { Queue } from "bullmq";
var crawlQueue = new Queue(QUEUE_NAME, {
  connection: bullMqRedis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1e3,
    attempts: 1,
    backoff: {
      type: "exponential",
      delay: 5e3
    }
  }
});

// src/events/publishQueuePositions.ts
async function publishQueuePositions() {
  const waiting = await crawlQueue.getWaiting();
  await Promise.all(
    waiting.map(async (job, index) => {
      await publishEvent({
        type: "audit.queued",
        payload: {
          crawlId: job.id,
          position: index + 1,
          ahead: index,
          waiting: waiting.length
        }
      });
    })
  );
}

// src/queue/activeCrawlers.ts
var activeCrawlers = /* @__PURE__ */ new Map();
var cancelledCrawls = /* @__PURE__ */ new Set();

// src/crawler/constants.ts
import path from "path";
var STORAGE_PATH = path.join(process.cwd(), "storage");
var ARTIFACTS_DIRECTORY = path.join(STORAGE_PATH, "artifacts");
var ARCHIVES_DIRECTORY = path.join(STORAGE_PATH, "archives");
var AUTH_HEADER = {
  Authorization: `Bearer ${process.env.CRAWLER_SECRET}`
};

// src/utils/filesystem.ts
import fs from "fs";
import path2 from "path";
import { ZipArchive } from "archiver";
async function deleteDirectoryIfExists(dir) {
  if (fs.existsSync(dir)) {
    await fs.promises.rm(
      dir,
      {
        recursive: true,
        force: true
      }
    );
  }
}
async function zipArtifacts(crawlId) {
  const sourceDir = path2.join(ARTIFACTS_DIRECTORY, crawlId);
  const zipPath = path2.join(ARCHIVES_DIRECTORY, `${crawlId}.zip`);
  const result = await zipDirectory(sourceDir, zipPath);
  await deleteDirectoryIfExists(sourceDir);
  return result.path;
}
function ensureDirectoryExistence(targetPath) {
  const dirname = path2.dirname(targetPath);
  if (!fs.existsSync(dirname)) {
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }
}
async function zipDirectory(sourceDir, outputZip) {
  return await new Promise((resolve, reject) => {
    if (fs.existsSync(outputZip)) {
      resolve({ path: outputZip });
    }
    if (!fs.existsSync(sourceDir)) {
      reject("Source directory not exists.");
    }
    ensureDirectoryExistence(outputZip);
    const output = fs.createWriteStream(outputZip);
    const archive = new ZipArchive({
      zlib: { level: 9 }
    });
    output.on("close", () => resolve({
      path: output.path
    }));
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    void archive.finalize();
  });
}

export {
  activeCrawlers,
  cancelledCrawls,
  bullMqRedis,
  QUEUE_NAME,
  CONCURRENCY,
  crawlQueue,
  ARTIFACTS_DIRECTORY,
  AUTH_HEADER,
  deleteDirectoryIfExists,
  zipArtifacts,
  publishEvent,
  publishQueuePositions
};
