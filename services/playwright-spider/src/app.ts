import express from 'express';
import type { Express } from "express";
import router from './routes';
import { authenticateInternalRequest } from './app/middleware/authenticateInternalRequest';

const app: Express = express();

app.use(express.json());

app.use(authenticateInternalRequest());

app.use('/api/v1', router);

export default app;
