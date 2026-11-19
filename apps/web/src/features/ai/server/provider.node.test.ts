import type { ResponseStreamEvent } from "openai/resources/responses/responses";
import { afterEach, expect, it, vi } from "vitest";
import { createAiTextProvider, normalizeAiEvents } from "./provider";

const streamTutor = createAiTextProvider({
  modelEnv: "OPENAI_TUTOR_MODEL",
  outputTokens: 2000,
});

async function collect<T>(items: AsyncIterable<T>) {
  const result: T[] = [];
  for await (const item of items) result.push(item);
  return result;
}
async function* events(items: unknown[]) {
  for (const item of items) yield item as ResponseStreamEvent;
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("forwards only visible text and confirmed completion", async () => {
  const output = await collect(
    normalizeAiEvents(
      events([
        { type: "response.reasoning_text.delta", delta: "not user output" },
        { type: "response.output_text.delta", delta: "hint" },
        { type: "response.completed", response: { status: "completed" } },
      ]),
    ),
  );
  expect(output).toEqual([{ type: "delta", text: "hint" }, { type: "done" }]);
});
it("does not report empty, refused, oversized, failed, incomplete or disconnected output as complete", async () => {
  for (const items of [
    [],
    [{ type: "response.completed" }],
    [
      { type: "response.refusal.delta", delta: "no" },
      { type: "response.completed" },
    ],
    [{ type: "response.incomplete" }],
    [{ type: "response.failed" }],
    [{ type: "error", message: "private error" }],
    [{ type: "response.output_text.delta", delta: "x".repeat(65537) }],
  ])
    await expect(collect(normalizeAiEvents(events(items)))).rejects.toThrow();
});
it("does not initialize a request without runtime credentials/model", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("OPENAI_TUTOR_MODEL", "gpt-5.4-mini");
  await expect(
    streamTutor(
      { instructions: "teach", input: [] },
      new AbortController().signal,
    ),
  ).rejects.toThrow("not configured");
  expect(fetch).not.toHaveBeenCalled();
});
it("uses the real SDK once with server configuration, no storage/tools and no automatic retries", async () => {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv("OPENAI_TUTOR_MODEL", "gpt-5.4-mini");
  const fetch = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
    Response.json(
      { error: { message: "rate limited", type: "rate_limit_error" } },
      { status: 429 },
    ),
  );
  vi.stubGlobal("fetch", fetch);
  await expect(
    streamTutor(
      {
        instructions: "hint-first",
        input: [{ role: "user", content: "context" }],
      },
      new AbortController().signal,
    ),
  ).rejects.toThrow();
  expect(fetch).toHaveBeenCalledTimes(1);
  const body = JSON.parse(fetch.mock.calls[0]?.[1]?.body as string);
  expect(body).toMatchObject({
    model: "gpt-5.4-mini",
    store: false,
    stream: true,
    tools: [],
    max_output_tokens: 2000,
    instructions: "hint-first",
  });
});

it("uses a capability-specific model or its fallback and requests the feature's structured format", async () => {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv("OPENAI_TUTOR_MODEL", "fallback-model");
  vi.stubEnv("OPENAI_EVALUATION_MODEL", "");
  const fetch = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) =>
    Response.json({ error: { message: "busy" } }, { status: 429 }),
  );
  vi.stubGlobal("fetch", fetch);
  const format = {
    name: "test_report",
    schema: { type: "object", properties: {} },
  };
  const evaluate = createAiTextProvider({
    modelEnv: "OPENAI_EVALUATION_MODEL",
    fallbackModelEnv: "OPENAI_TUTOR_MODEL",
    outputTokens: 3000,
    format,
  });
  await expect(
    evaluate(
      { instructions: "evaluate", input: [] },
      new AbortController().signal,
    ),
  ).rejects.toThrow();
  expect(JSON.parse(fetch.mock.calls[0]?.[1]?.body as string)).toMatchObject({
    model: "fallback-model",
    max_output_tokens: 3000,
    text: { format: { type: "json_schema", strict: true, ...format } },
  });
  vi.stubEnv("OPENAI_EVALUATION_MODEL", "evaluation-model");
  await expect(
    evaluate(
      { instructions: "evaluate", input: [] },
      new AbortController().signal,
    ),
  ).rejects.toThrow();
  expect(JSON.parse(fetch.mock.calls[1]?.[1]?.body as string).model).toBe(
    "evaluation-model",
  );
  expect(fetch).toHaveBeenCalledTimes(2);
});
