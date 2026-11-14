import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { counterProblem } from "@workspace/problems";
import { afterEach, expect, it, vi } from "vitest";
import { ProblemSession } from "../state/problem-session";
import { ProblemTutorSession } from "../state/problem-tutor";
import { ProblemTutor, TutorAnswer } from "./problem-tutor";

afterEach(() => vi.unstubAllGlobals());
it("renders model Markdown without raw HTML, images, unsafe links or executable components", () => {
  const view = render(
    <TutorAnswer>
      {
        'Try **one step**.\n\n```javascript\nconst count = 0;\n```\n\n<img src="https://example.com/track">\n\n<script>alert(1)</script>\n\n![remote](https://example.com/image.png)\n\n[unsafe](javascript:alert(1)) [safe](https://example.com/help)'
      }
    </TutorAnswer>,
  );
  expect(screen.getByText("one step").tagName).toBe("STRONG");
  expect(view.container.querySelector("pre code")).toHaveTextContent(
    "const count = 0;",
  );
  expect(view.container.querySelector("img,script")).toBeNull();
  expect(screen.queryByRole("link", { name: "unsafe" })).toBeNull();
  expect(screen.getByRole("link", { name: "safe" })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
});
it("keeps Enter for multiline input, sends on Mod-Enter and retains a failed question for explicit retry", async () => {
  const fetch = vi.fn(async () =>
    Response.json(
      { error: "AI tutor is not configured. Your code and question are kept." },
      { status: 503 },
    ),
  );
  vi.stubGlobal("fetch", fetch);
  render(
    <ProblemSession problem={counterProblem}>
      <ProblemTutorSession>
        <ProblemTutor />
      </ProblemTutorSession>
    </ProblemSession>,
  );
  const question = screen.getByRole("textbox", { name: "Your question" });
  expect(screen.getByRole("button", { name: "Send question" })).toBeDisabled();
  fireEvent.change(question, { target: { value: "I'm stuck\non this line" } });
  fireEvent.keyDown(question, { key: "Enter" });
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.keyDown(question, { key: "Enter", ctrlKey: true });
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  expect(await screen.findByRole("alert")).toHaveTextContent("not configured");
  expect(screen.getByText("I'm stuck on this line")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Retry with current code" }),
  ).toBeEnabled();
});
