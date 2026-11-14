import type { ResponseStreamEvent } from "openai/resources/responses/responses";
import { afterEach, expect, it, vi } from "vitest";
import { normalizeTutorEvents, streamTutor } from "./tutor-provider";

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
    normalizeTutorEvents(
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
    await expect(
      collect(normalizeTutorEvents(events(items))),
    ).rejects.toThrow();
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
