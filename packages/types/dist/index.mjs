// src/events.ts
var EventEnum = /* @__PURE__ */ ((EventEnum2) => {
  EventEnum2["Queued"] = "audit.queued";
  EventEnum2["Started"] = "audit.started";
  EventEnum2["Progress"] = "audit.progress";
  EventEnum2["Completed"] = "audit.completed";
  EventEnum2["Failed"] = "audit.failed";
  EventEnum2["Cancelled"] = "audit.cancelled";
  EventEnum2["PageStarted"] = "audit.page.started";
  EventEnum2["PageSkipped"] = "audit.page.skipped";
  EventEnum2["PageFailed"] = "audit.page.failed";
  EventEnum2["PageCompleted"] = "audit.page.completed";
  EventEnum2["CrawlerTelemetry"] = "crawler.telemetry";
  return EventEnum2;
})(EventEnum || {});

// src/react.ts
var StatusEnum = /* @__PURE__ */ ((StatusEnum2) => {
  StatusEnum2["Queued"] = "queued";
  StatusEnum2["Started"] = "started";
  StatusEnum2["Cancelled"] = "cancelled";
  StatusEnum2["Failed"] = "failed";
  StatusEnum2["Completed"] = "completed";
  return StatusEnum2;
})(StatusEnum || {});

export { EventEnum, StatusEnum };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map