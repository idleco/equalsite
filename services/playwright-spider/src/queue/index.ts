import { crawlEvents } from "./events";

export { crawlQueue } from './queue';
export { activeCrawlers, cancelledCrawls } from './activeCrawlers';
export { crawlWorker } from './worker';

function registerEventsListener() {
    crawlEvents.on('completed', (args, id) => {
        console.log('crawl events completed', { args, id });
    });

    crawlEvents.on('active', (args, id) => {
        console.log('crawl events active', { args, id });
    });
}

registerEventsListener();
