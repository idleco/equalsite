import './queue/crawlWorker';
import { startTelemetryLoop, stopTelemetryLoop } from './events/startTelemetryLoop';

startTelemetryLoop();

process.on(
    'SIGTERM',
    () => {
        stopTelemetryLoop();
        process.exit(0);
    }
)
