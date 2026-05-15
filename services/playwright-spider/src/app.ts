import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { createHealthRouter } from "./routes/health";
import { createPlaywrightRouter } from "./routes/playwright";

export function createApp() {
    const app = express();

    app.use(express.json());

    app.use(createHealthRouter());
    app.use(createPlaywrightRouter());

    app.use(errorHandler);

    return app;
}
