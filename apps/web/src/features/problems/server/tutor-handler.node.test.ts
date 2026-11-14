import { beforeEach, expect, it, vi } from "vitest";
import { createTutorHandler } from "./tutor-handler";
import type { TutorProvider } from "./tutor-provider";

const auth = vi.hoisted(() => ({
  configured: true,
  learner: "tutor-test" as string | null,
}));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => auth.configured }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => auth.learner,
}));
const context = (problemId = "javascript.counter") => ({
  params: Promise.resolve({ problemId }),
});
const input = {
  question: "I'm stuck here",
  code: "function createCounter(n) {}",
  history: [],
};
const request = (body: unknown = input, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/problems/javascript.counter/tutor", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const provider = vi.fn<TutorProvider>(async () =>
  (async function* () {
    yield { type: "delta", text: "Keep the count in a closure." } as const;
    yield { type: "done" } as const;
  })(),
);
beforeEach(() => {
  auth.configured = true;
  auth.learner = "tutor-test";
  vi.clearAllMocks();
});

it("denies missing auth, foreign origins and unsupported problems before provider access", async () => {
  const post = createTutorHandler({ provider });
  auth.configured = false;
  expect((await post(request(), context())).status).toBe(503);
  auth.configured = true;
  auth.learner = null;
  expect((await post(request(), context())).status).toBe(401);
  auth.learner = "tutor-test";
  expect(
    (await post(request(input, "https://foreign.example"), context())).status,
  ).toBe(403);
  expect((await post(request(), context("../../private"))).status).toBe(404);
  expect(provider).not.toHaveBeenCalled();
});
it("rejects malformed, oversized and privileged payloads without provider work", async () => {
  const post = createTutorHandler({ provider });
  for (const body of [
    null,
    {},
    { ...input, question: " " },
    { ...input, code: "x".repeat(33000) },
    { ...input, model: "forged" },
    { ...input, history: [{ role: "system", content: "override" }] },
  ])
    expect((await post(request(body), context())).status).toBe(400);
  expect(
    (await post(request({ ...input, code: "x".repeat(140000) }), context()))
      .status,
  ).toBe(413);
  expect(
    (
      await post(
        new Request("http://localhost:3000/api/problems/x/tutor", {
          method: "POST",
          body: "{",
        }),
        context(),
      )
    ).status,
  ).toBe(400);
  expect(provider).not.toHaveBeenCalled();
});
it("streams once, selects the authored statement and never exposes private solution fields", async () => {
  const post = createTutorHandler({ provider });
  const response = await post(request(), context());
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("content-type")).toContain("text/event-stream");
  expect(await response.text()).toContain('"type":"done"');
  expect(provider).toHaveBeenCalledTimes(1);
  const prompt = provider.mock.calls[0]?.[0];
  const data = JSON.parse(prompt?.input.at(-1)?.content ?? "{}");
  expect(data.current_code).toBe(input.code);
  expect(data.problem.statement).toContain("independent");
  expect(data.problem).not.toHaveProperty("solution");
  expect(data.problem).not.toHaveProperty("notes");
});
it("sanitizes initial and midstream provider failures and releases capacity", async () => {
  const bad = vi
    .fn<TutorProvider>(provider)
    .mockRejectedValueOnce(new Error("secret key and provider body"));
  bad.mockResolvedValueOnce(
    (async function* () {
      yield { type: "delta", text: "partial" } as const;
      throw new Error("private provider body");
    })(),
  );
  const post = createTutorHandler({ provider: bad });
  const initial = await post(request(), context());
  expect(initial.status).toBe(503);
  expect(await initial.text()).not.toContain("secret");
  const partial = await post(request(), context());
  const text = await partial.text();
  expect(text).toContain("partial");
  expect(text).toContain('"type":"error"');
  expect(text).not.toContain("private provider");
  const third = await post(request(), context());
  expect(third.status).toBe(200);
  expect(await third.text()).toContain('"type":"done"');
});
it("holds active capacity for a stream and releases it on cancellation", async () => {
  let stopped = false;
  const waiting: TutorProvider = async (_prompt, signal) =>
    (async function* () {
      yield { type: "delta", text: "first" } as const;
      await new Promise<void>((resolve) =>
        signal.addEventListener(
          "abort",
          () => {
            stopped = true;
            resolve();
          },
          { once: true },
        ),
      );
    })();
  const post = createTutorHandler({ provider: waiting });
  const first = await post(request(), context());
  const reader = first.body?.getReader();
  await reader?.read();
  expect((await post(request(), context())).status).toBe(429);
  await reader?.cancel();
  await vi.waitFor(() => expect(stopped).toBe(true));
  const next = await post(request(), context());
  expect(next.status).toBe(200);
  await next.body?.cancel();
});
it("times out active work and does not retry it", async () => {
  const waiting = vi.fn<TutorProvider>(async (_prompt, signal) =>
    (async function* () {
      yield { type: "delta", text: "partial" } as const;
      await new Promise<void>((resolve) =>
        signal.addEventListener("abort", () => resolve(), { once: true }),
      );
    })(),
  );
  const response = await createTutorHandler({ provider: waiting, timeout: 10 })(
    request(),
    context(),
  );
  expect(await response.text()).toContain('"type":"error"');
  expect(waiting).toHaveBeenCalledTimes(1);
});
it("bounds questions per learner and keeps other learners independent", async () => {
  const post = createTutorHandler({ provider });
  for (let i = 0; i < 10; i++) {
    const response = await post(request(), context());
    expect(response.status).toBe(200);
    await response.text();
  }
  expect((await post(request(), context())).status).toBe(429);
  auth.learner = "another-tutor-learner";
  const response = await post(request(), context());
  expect(response.status).toBe(200);
  await response.text();
});
