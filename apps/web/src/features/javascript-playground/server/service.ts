import "server-only";
import { runSandboxWorker } from "@/features/problems/server/worker-pool";
import type { PlaygroundResult } from "../run-result";

export function runPlaygroundScript(code: string, signal?: AbortSignal) {
  return runSandboxWorker<PlaygroundResult>({
    name: "script-worker",
    data: () => ({ code }),
    signal,
    timeoutMs: 6_000,
    timeoutResult: {
      status: "time-limit-exceeded",
      message: "The script exceeded its time limit.",
      logs: [],
    },
  });
}
