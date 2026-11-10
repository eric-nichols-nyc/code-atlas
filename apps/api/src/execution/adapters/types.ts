import type { ProblemOutput, Verdict } from "@workspace/problems";
import type { QuickJSContext, QuickJSHandle } from "quickjs-emscripten";
export interface GuestAccess {
  ctx: QuickJSContext;
  fn: QuickJSHandle;
  isArray: QuickJSHandle;
  enter: <T>(call: () => T) => T;
  errorText: (error: QuickJSHandle) => string;
  exceeded: () => boolean;
}
export interface CaseOutcome {
  verdict: Verdict;
  message: string;
  expected?: ProblemOutput;
  actual?: ProblemOutput;
}
export interface VirtualClock {
  now: () => number;
  advance: (target: number, inclusive?: boolean) => Verdict | null;
}
