export { crawlQueue } from './crawlQueue';
export { activeCrawlers, cancelledCrawls } from './activeCrawlers';
export { crawlWorker } from './crawlWorker';

// function registerEventsListener() {
//     crawlEvents.on('completed', (args, id) => {
//         console.log('crawl events completed', { args, id });
//     });

//     crawlEvents.on('active', (args, id) => {
//         console.log('crawl events active', { args, id });
//     });
// }

// registerEventsListener();
