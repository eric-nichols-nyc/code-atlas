import { afterEach, expect, it, vi } from "vitest";
import {
  evaluationScore,
  parseCodeEvaluation,
} from "../lib/code-evaluation-contract";
import { SAMPLE_EVALUATION } from "../lib/code-evaluation-sample";
import { evaluationSamplesEnabled } from "./evaluation-samples";

afterEach(() => vi.unstubAllEnvs());
it("keeps samples opt-in in production while making them available for local development", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("CODE_ATLAS_EVALUATION_SAMPLES", "");
  expect(evaluationSamplesEnabled()).toBe(false);
  vi.stubEnv("CODE_ATLAS_EVALUATION_SAMPLES", "true");
  expect(evaluationSamplesEnabled()).toBe(true);
  vi.stubEnv("CODE_ATLAS_EVALUATION_SAMPLES", "");
  vi.stubEnv("NODE_ENV", "development");
  expect(evaluationSamplesEnabled()).toBe(true);
  expect(evaluationScore(parseCodeEvaluation(SAMPLE_EVALUATION))).toBe(6);
});
