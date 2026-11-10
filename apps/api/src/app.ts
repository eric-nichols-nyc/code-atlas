import { clerkMiddleware, getAuth } from "@clerk/express";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { executionRoutes } from "./execution/routes.js";
import type { executeProblem } from "./execution/service.js";

export type ApiConfig = {
  publishableKey?: string;
  secretKey?: string;
  allowedOrigins?: string[];
};

export function createApp(
  config: ApiConfig = {},
  services: { execute?: typeof executeProblem } = {},
) {
  const app = express();
  const allowedOrigins = config.allowedOrigins ?? ["http://localhost:3000"];
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "api" });
  });

  // Every /v1 endpoint requires authentication, including future routes.
  app.use("/v1", (request, response, next) => {
    if (!config.publishableKey || !config.secretKey) {
      response.status(503).json({ error: "Authentication is not configured" });
      return;
    }
    return clerkMiddleware({
      publishableKey: config.publishableKey,
      secretKey: config.secretKey,
      authorizedParties: allowedOrigins,
    })(request, response, next);
  });
  app.use("/v1", (request, response, next) => {
    if (!getAuth(request).userId) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  });

  app.use("/v1/problems", executionRoutes(services.execute));

  app.get("/v1/me", (request, response) => {
    response.json({ userId: getAuth(request).userId });
  });

  app.use((_request, response) =>
    response.status(404).json({ error: "Not found" }),
  );
  const handleError: ErrorRequestHandler = (
    _error,
    _request,
    response,
    _next,
  ) => {
    response.status(500).json({ error: "Internal server error" });
  };
  app.use(handleError);
  return app;
}
