import type { PlaywrightCrawler } from "crawlee";
export interface ActiveCrawler {
    crawler: PlaywrightCrawler;
    startingUrl: string;
    startedAt: Date;
}
declare const activeJobs: Map<string, ActiveCrawler>;
export default activeJobs;
