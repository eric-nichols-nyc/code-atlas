import { getAuth } from "@clerk/express";
import { findProblem, publicProblems } from "@workspace/problems";
import { Router } from "express";
import type { ProgressService } from "./service.js";

export function progressRoutes(progress: ProgressService) {
  const router = Router();
  // Each resource verifies identity before invoking database access.
  router.use((req, res, next) => {
    if (!getAuth(req).userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.set("Cache-Control", "no-store");
    next();
  });
  router.get("/", async (req, res) => {
    try {
      res.json({ records: await progress.list(getAuth(req).userId as string) });
    } catch {
      res
        .status(503)
        .json({ error: "Account progress is unavailable. Please retry." });
    }
  });
  router.post("/import", async (req, res) => {
    const body = req.body;
    const valid = (ids: unknown): ids is string[] =>
      Array.isArray(ids) &&
      ids.length <= publicProblems.length &&
      ids.every((id) => typeof id === "string" && findProblem(id)?.id === id);
    if (
      !body ||
      Object.keys(body).some((key) => !["flagged", "solved"].includes(key)) ||
      !valid(body.flagged) ||
      !valid(body.solved)
    ) {
      res
        .status(400)
        .json({ error: "Provide valid legacy flags and completion records." });
      return;
    }
    try {
      res.json({
        records: await progress.importLegacy(
          getAuth(req).userId as string,
          body.flagged,
          body.solved,
        ),
      });
    } catch {
      res.status(503).json({
        error: "Browser records are kept. Account import failed; please retry.",
      });
    }
  });
  router.get("/:problemId", async (req, res) => {
    const problem = findProblem(req.params.problemId as string);
    if (!problem) {
      res.status(404).json({ error: "Problem unavailable" });
      return;
    }
    try {
      res.json({
        record: await progress.read(getAuth(req).userId as string, problem.id),
      });
    } catch {
      res.status(503).json({
        error: "Saved code is unavailable. Your current code is kept.",
      });
    }
  });
  router.patch("/:problemId", async (req, res) => {
    const problem = findProblem(req.params.problemId as string);
    if (!problem) {
      res.status(404).json({ error: "Problem unavailable" });
      return;
    }
    const body = req.body;
    if (
      !body ||
      Object.keys(body).length !== 1 ||
      typeof body.flagged !== "boolean"
    ) {
      res
        .status(400)
        .json({ error: "Only flagged status may be changed here." });
      return;
    }
    try {
      res.json({
        record: await progress.flag(
          getAuth(req).userId as string,
          problem.id,
          body.flagged,
        ),
      });
    } catch {
      res
        .status(503)
        .json({ error: "Flag was not saved to your account. Please retry." });
    }
  });
  return router;
}
