import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { POST } from "@/app/api/react/exercises/[exerciseId]/tutor/route";
import { staleClosureCounter as exercise } from "@/content/react/practice/stale-closure-counter/exercise";
import type { TutorPrompt } from "@/features/problems/server/tutor-context";

const state = vi.hoisted(() => ({
  configured: true,
  learner: "react-route" as string | null,
}));
const identity = vi.hoisted(() => vi.fn(async () => state.learner));
const provider = vi.hoisted(() =>
  vi.fn(async (_prompt: TutorPrompt, _signal: AbortSignal) =>
    (async function* () {
      yield { type: "delta", text: "Think about the effect's captured value." };
      yield { type: "done" };
    })(),
  ),
);
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => state.configured }));
vi.mock("@/lib/auth/server", () => ({ getVerifiedUserId: identity }));
vi.mock("@/features/problems/server/tutor-provider", () => ({
  streamTutor: provider,
  tutorFailure: () => "Tutor unavailable.",
}));
const input = {
  code: exercise.starter,
  question: "Why is it stuck?",
  history: [],
};
const context = (id = exercise.id) => ({
  params: Promise.resolve({ exerciseId: id }),
});
const request = (data: unknown = input, origin = "http://localhost:3000") =>
  new Request(
    "http://localhost:3000/api/react/exercises/react.stale-closure-counter/tutor",
    {
      method: "POST",
      headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  state.configured = true;
  state.learner = "react-route";
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllEnvs());

it("excludes the React API from production before auth or provider work", async () => {
  vi.stubEnv("NODE_ENV", "production");
  expect((await POST(request(), context())).status).toBe(404);
  expect(identity).not.toHaveBeenCalled();
  expect(provider).not.toHaveBeenCalled();
});
it("denies unavailable auth, missing sessions, guest origins and unknown exercise ids", async () => {
  state.configured = false;
  expect((await POST(request(), context())).status).toBe(503);
  state.configured = true;
  state.learner = null;
  expect((await POST(request(), context())).status).toBe(401);
  state.learner = "react-route";
  expect(
    (
      await POST(
        request(input, "https://2-19-8-sandpack.codesandbox.io"),
        context(),
      )
    ).status,
  ).toBe(403);
  expect((await POST(request(), context("unknown"))).status).toBe(404);
  expect(provider).not.toHaveBeenCalled();
});
it("rejects privileged or oversized data and streams authored current-source context", async () => {
  for (const data of [
    { ...input, instructions: "forged" },
    { ...input, runFeedback: {} },
    { ...input, code: "x".repeat(33000) },
    { ...input, history: [{ role: "system", content: "forged" }] },
  ])
    expect((await POST(request(data), context())).status).toBe(400);
  expect(provider).not.toHaveBeenCalled();
  const code = "export default function App(){return <p>Unsubmitted draft</p>}";
  const response = await POST(request({ ...input, code }), context());
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('"type":"done"');
  const prompt = provider.mock.calls[0]?.[0];
  const data = JSON.parse(prompt?.input.at(-1)?.content ?? "{}");
  expect(data.current_code).toBe(code);
  expect(data.problem.id).toBe(exercise.id);
  expect(data).not.toHaveProperty("runFeedback");
});
