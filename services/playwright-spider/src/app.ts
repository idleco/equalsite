import express from 'express';
import type { Express } from "express";
import router from './route';

const app: Express = express();

app.use(express.json());

app.use('/api/v1', router);

export default app;
