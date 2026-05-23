import express from "express";
import type { Express } from "express";
import { errorHandler } from "./middleware/errorHandler";
import crawlerRoutes from "./api/crawler";
import healthRoutes from './api/health';

const app: Express = express();

app.use(express.json());

app.use(healthRoutes);
app.use(crawlerRoutes);

app.use(errorHandler);

export default app;
