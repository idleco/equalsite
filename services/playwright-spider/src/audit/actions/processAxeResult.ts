import type { AxeResults } from "axe-core";
import type { EventPublisher } from "../repositories/eventPublisher";
import type { ServerityBreakdown } from "@equalsite/types";
import { pageCompletedEvent } from "../events/pageCompletedEvent";
import type { PlaywrightCrawler } from "crawlee";

export interface IProcessAxeResultAction {
    run: (params: {
        auditId: string;
        pageUrl: string;
        axeResults: AxeResults
    }) => Promise<void>;
}

export const createProcessAxeResultAction = (
    pushData: PlaywrightCrawler['pushData'],
    eventPublisher: EventPublisher,
): IProcessAxeResultAction => ({
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

        const severityBreakdown = accessibilityViolations
            .reduce<ServerityBreakdown>(
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

        await eventPublisher(
            pageCompletedEvent({
                auditId,
                pageUrl,
                severityBreakdown,
                accessibilityViolationsCount: accessibilityViolations.length,
            })
        );
    }
})
