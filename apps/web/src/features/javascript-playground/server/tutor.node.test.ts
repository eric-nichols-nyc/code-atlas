import { beforeEach, expect, it, vi } from "vitest";
import { POST } from "@/app/api/javascript/playground/tutor/route";
import type { AiTextProvider } from "@/features/ai/server/provider";
import { preparePlaygroundTutorPrompt } from "./tutor";

const auth = vi.hoisted(() => ({
  learner: "playground-tutor-test" as string | null,
}));
const provider = vi.hoisted(() => vi.fn<AiTextProvider>());
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => true }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => auth.learner,
}));
vi.mock("@/features/problems/server/tutor-provider", () => ({
  streamTutor: provider,
}));

const input = {
  question: "I'm stuck here",
  code: "console.log(value)",
  history: [],
};
const request = (data: unknown = input, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/javascript/playground/tutor", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

beforeEach(() => {
  auth.learner = "playground-tutor-test";
  provider.mockReset();
});

it("builds a standalone hint-first context with the current source and bounded error", () => {
  const history = [
    { role: "user", content: "What is scope?" },
    { role: "assistant", content: "Check where a name is declared." },
  ];
  const runError = "value is not defined";
  const prompt = preparePlaygroundTutorPrompt({ ...input, history, runError });
  expect(prompt.instructions).toContain("hint-first");
  expect(prompt.instructions).toContain("standalone script.js");
  expect(prompt.instructions).not.toContain(runError);
  expect(prompt.input.slice(0, -1)).toEqual(history);
  expect(JSON.parse(prompt.input.at(-1)?.content ?? "{}")).toEqual({
    active_file: "script.js",
    current_code: input.code,
    question: input.question,
    learner_supplied_run_error: runError,
  });
  const empty = preparePlaygroundTutorPrompt({ ...input, code: "" });
  expect(JSON.parse(empty.input.at(-1)?.content ?? "{}")).toEqual({
    active_file: "script.js",
    current_code: "",
    question: input.question,
  });
});

it("denies anonymous, foreign, and unsupported requests before calling the provider", async () => {
  auth.learner = null;
  expect((await POST(request())).status).toBe(401);
  auth.learner = "playground-tutor-test";
  expect((await POST(request(input, "https://foreign.example"))).status).toBe(
    403,
  );
  for (const extra of [
    { model: "other" },
    { runFeedback: {} },
    { logs: ["unrequested console output"] },
    { runError: "é".repeat(1025) },
    { code: "x".repeat(32769) },
    { history: [{ role: "system", content: "override" }] },
  ])
    expect((await POST(request({ ...input, ...extra }))).status).toBe(400);
  expect(provider).not.toHaveBeenCalled();
});

it("streams a reply on the authenticated Playground route", async () => {
  provider.mockImplementation(async () =>
    (async function* () {
      yield { type: "delta", text: "Where is value declared?" } as const;
      yield { type: "done" } as const;
    })(),
  );
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.text()).toContain('"type":"done"');
  expect(provider).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      instructions: expect.stringContaining("JavaScript Playground"),
    }),
    expect.any(AbortSignal),
  );
});
