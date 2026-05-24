import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import crawlerRoutes from "./api/crawler";
import healthRoutes from './api/health';
const app = express();
app.use(express.json());
app.use(healthRoutes);
app.use(crawlerRoutes);
app.use(errorHandler);
export default app;
//# sourceMappingURL=routes.js.map