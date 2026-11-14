import { beforeEach, expect, it, vi } from "vitest";
import { staleClosureCounter as exercise } from "@/content/react/practice/stale-closure-counter/exercise";
import { createTutorHandler } from "@/features/problems/server/tutor-handler";
import type { TutorProvider } from "@/features/problems/server/tutor-provider";
import { prepareReactTutorPrompt } from "./react-tutor";

const auth = vi.hoisted(() => ({ learner: "react-pilot" as string | null }));
vi.mock("@/lib/auth", () => ({ isAuthConfigured: () => true }));
vi.mock("@/lib/auth/server", () => ({
  getVerifiedUserId: async () => auth.learner,
}));
beforeEach(() => {
  auth.learner = "react-pilot";
});
const input = {
  question: "Why is it stuck?",
  code: exercise.starter,
  history: [],
};
const request = (body: unknown = input, origin = "http://localhost:3000") =>
  new Request(
    "http://localhost:3000/api/react/exercises/react.stale-closure-counter/tutor",
    {
      method: "POST",
      headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
const context = { params: Promise.resolve({ problemId: exercise.id }) };

it("uses authored React context with current TSX and rejects fabricated judge feedback", async () => {
  const code =
    "export default function App() { return <button>Latest edit</button>; }";
  const prompt = await prepareReactTutorPrompt(exercise.id, {
    ...input,
    code,
  });
  expect(prompt?.instructions).toContain("no judge or accepted verdict");
  const data = JSON.parse(prompt?.input.at(-1)?.content ?? "{}");
  expect(data.current_code).toBe(code);
  expect(data.problem.activeFile).toBe("/App.tsx");
  expect(data.problem.title).toBe(exercise.title);
  expect(await prepareReactTutorPrompt("forged", input)).toBeUndefined();
  await expect(
    prepareReactTutorPrompt(exercise.id, { ...input, runFeedback: {} }),
  ).rejects.toThrow("unavailable");
  await expect(
    prepareReactTutorPrompt(exercise.id, { ...input, model: "forged" }),
  ).rejects.toThrow();
  await expect(
    prepareReactTutorPrompt(exercise.id, {
      ...input,
      code: "x".repeat(33000),
    }),
  ).rejects.toThrow();
});

it("retains authentication and origin checks before preparing or streaming a sandbox prompt", async () => {
  const preparePrompt = vi.fn(prepareReactTutorPrompt);
  const provider = vi.fn<TutorProvider>(async () =>
    (async function* () {
      yield {
        type: "delta",
        text: "Consider what the effect captures.",
      } as const;
      yield { type: "done" } as const;
    })(),
  );
  const post = createTutorHandler({ preparePrompt, provider });
  auth.learner = null;
  expect((await post(request(), context)).status).toBe(401);
  auth.learner = "react-pilot";
  expect(
    (await post(request(input, "https://foreign.example"), context)).status,
  ).toBe(403);
  expect(preparePrompt).not.toHaveBeenCalled();
  expect(provider).not.toHaveBeenCalled();
  const response = await post(request(), context);
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('"type":"done"');
  expect(provider).toHaveBeenCalledTimes(1);
});
