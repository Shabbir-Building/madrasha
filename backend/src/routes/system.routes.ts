import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { getConnectionInfo } from "../config/database";
import { HttpStatus } from "../config/constants";
import { type ApiResponse } from "@/types/common";

import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * Health check endpoint with database status
 */
router.get("/health", (_req: Request, res: Response) => {
  const dbInfo = getConnectionInfo();
  const isHealthy = dbInfo.status === "connected";

  const response: ApiResponse = {
    success: isHealthy,
    message: isHealthy
      ? "Server and database are healthy"
      : "Server running but database disconnected",
    data: {
      server: {
        status: "running",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      database: dbInfo,
    },
    timestamp: new Date().toISOString(),
  };

  res
    .status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
    .json(response);
});

/**
 * Test endpoint
 */
router.get("/test", (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: "Test route working",
    data: {
      environment: env.NODE_ENV,
      clientUrl: env.CLIENT_URL,
      databaseConnected: mongoose.connection.readyState === 1,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(HttpStatus.OK).json(response);
});

/**
 * Seed data endpoint (Development only)
 */
router.post(
  "/seed",
  asyncHandler(async (_req: Request, res: Response) => {
    if (env.NODE_ENV === "production") {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "Seeding is not allowed in production",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: "Data cleared and seeded successfully",
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }),
);

/**
 * Clear data endpoint (Development only)
 */
router.post(
  "/clear",
  asyncHandler(async (_req: Request, res: Response) => {
    if (env.NODE_ENV === "production") {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "Clearing data is not allowed in production",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: "Data cleared successfully",
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }),
);

export default router;
