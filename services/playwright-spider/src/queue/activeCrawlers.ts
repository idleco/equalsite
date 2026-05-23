import type { PlaywrightCrawler } from "crawlee";

export interface ActiveCrawler {
    crawler: PlaywrightCrawler;
    crawlId: string;
    startingUrl: string;
    startedAt: Date;
}

export const activeCrawlers = new Map<string, ActiveCrawler>();

export const cancelledCrawls = new Set<string>();
