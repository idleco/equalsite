import { publishTelemetry } from "./publishTelemetry";

let started = false;
let interval: NodeJS.Timeout;

export function startTelemetryLoop() {
    if (started) {
        return;
    }
    started = true;
    interval = setInterval(async () => {
        try {
            await publishTelemetry();
        } catch (error) {
            console.error(
                'Telemetry publish failed',
                error,
            );
        }
    }, 10000);
}

export function stopTelemetryLoop() {
    clearInterval(interval)
}
