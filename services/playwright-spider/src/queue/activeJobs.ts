import type { PlaywrightCrawler } from "crawlee";

export interface ActiveCrawler {
    crawler: PlaywrightCrawler;
    startingUrl: string;
    startedAt: Date;
}

const activeJobs = new Map<string, ActiveCrawler>();

export default activeJobs
