import type { PlaywrightCrawlerOptions } from "crawlee";
import { EnqueueStrategy } from "crawlee";
import { pageStartedEvent } from "../events/pageStartedEvent";
import type { EventPublisher } from "../repositories/eventPublisher";
import { createProcessAxeResultAction } from "./processAxeResult";
import AxeBuilder from "@axe-core/playwright";
import { progressEvent } from "../events/progressEvent";

export const createAuditPageRequestHandler = (
    auditId: string,
    eventPublisher: EventPublisher,
): PlaywrightCrawlerOptions['requestHandler'] => async ({
    request,
    page,
    pushData,
    enqueueLinks,
    crawler
}) => {
    await eventPublisher(pageStartedEvent({
        auditId,
        pageUrl: request.url,
        attemptsCount: request.retryCount
    }));

    const processAxeResultAction = createProcessAxeResultAction(pushData, eventPublisher);

    const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();

    await processAxeResultAction.run({
        pageUrl: request.url,
        auditId,
        axeResults
    });

    const queue = await crawler.getRequestQueue();
    const info = await queue.getInfo();

    await eventPublisher(progressEvent({
        auditId,
        completedRequests: info?.handledRequestCount ?? 0,
        pendingRequests: info?.pendingRequestCount ?? 0,
        totalRequests: info?.totalRequestCount ?? 0,
    }));

    await enqueueLinks({
        strategy: EnqueueStrategy.SameDomain,
        selector: 'a',
    });
}
