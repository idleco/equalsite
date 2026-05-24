import type { PlaywrightCrawler } from "crawlee";
export interface ActiveCrawler {
    crawler: PlaywrightCrawler;
    crawlId: string;
    startingUrl: string;
    startedAt: Date;
}
export declare const activeCrawlers: Map<string, ActiveCrawler>;
export declare const cancelledCrawls: Set<string>;
