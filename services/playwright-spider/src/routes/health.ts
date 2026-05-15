import { Router } from "express";
import { publish } from "../lib/redis";

export function createHealthRouter() {
  const router = Router();

  router.get("/health", (_req, res) => {
    publish('laravel_events', {
        message: "Its working!"
    });

    res.json({ ok: true });
  });

  return router;
}
