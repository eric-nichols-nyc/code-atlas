import type { PlaygroundResult } from "../problems/server/script-worker";

export type { PlaygroundResult };

export function isPlaygroundResult(value: unknown): value is PlaygroundResult {
  if (!value || typeof value !== "object" || !("status" in value)) return false;
  if (
    !("logs" in value) ||
    !Array.isArray(value.logs) ||
    !value.logs.every((line) => typeof line === "string")
  )
    return false;
  return (
    value.status === "finished" ||
    ((value.status === "error" || value.status === "time-limit-exceeded") &&
      "message" in value &&
      typeof value.message === "string")
  );
}
