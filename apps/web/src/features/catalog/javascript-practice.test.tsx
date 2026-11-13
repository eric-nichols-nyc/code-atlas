import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { javascriptPracticeCatalog } from "@/content/javascript/practice/catalog";
import { JavaScriptPractice } from "./components/javascript-practice";

afterEach(() => vi.unstubAllGlobals());

it("opens the Promise delay problem in Async and finds it through search", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Async" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByRole("searchbox", { name: "Search problems" }), {
    target: { value: "fulfillment" },
  });
  expect(
    screen.getByRole("link", { name: "Delay the Resolution of Each Promise" }),
  ).toHaveAttribute(
    "href",
    "/javascript/practice/delay-the-resolution-of-each-promise",
  );
  expect(screen.getByRole("status")).toHaveTextContent("1 problem");
});

it("keeps an empty practice catalog honest without problem links", () => {
  render(<JavaScriptPractice catalog={[]} />);
  expect(
    screen.getByText("Practice problems are on the way. Check back soon."),
  ).toBeVisible();
  expect(screen.queryByRole("list")).toBeNull();
  expect(screen.getByRole("tab", { name: "Recommended" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
it("clears an empty query result back to the practice problems", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  fireEvent.change(screen.getByRole("searchbox", { name: "Search problems" }), {
    target: { value: "no matching concept" },
  });
  expect(screen.getByRole("status")).toHaveTextContent("0 problems");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getAllByRole("row")).toHaveLength(14);
  expect(screen.getByRole("status")).toHaveTextContent("13 problems");
});

it("opens the canonical practice problem without listing planned learning topics", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  expect(screen.getByRole("link", { name: /Sleep/ })).toHaveAttribute(
    "href",
    "/javascript/practice/sleep",
  );
  expect(screen.queryByText("Scope and shadowing")).toBeNull();
  expect(
    screen.getByRole("table", { name: "Practice problems" }),
  ).toBeVisible();
  expect(
    screen.getAllByRole("columnheader").map((cell) => cell.textContent),
  ).toEqual(["Problem", "Difficulty", "Topic", "Solved"]);
  expect(
    screen.queryByText(javascriptPracticeCatalog[0]?.summary ?? ""),
  ).toBeNull();
});

it("lists Sleep in both Recommended and Async and searches within the selected category", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  expect(
    screen.getByRole("heading", { name: "Recommended problems" }),
  ).toBeVisible();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Async" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.getByRole("tab", { name: "Async" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("heading", { name: "Async problems" })).toBeVisible();
  expect(screen.getByRole("link", { name: /Sleep/ })).toHaveAttribute(
    "href",
    "/javascript/practice/sleep",
  );
  fireEvent.change(screen.getByRole("searchbox", { name: "Search problems" }), {
    target: { value: "missing" },
  });
  expect(screen.queryByRole("link", { name: /Sleep/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByRole("tab", { name: "Async" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("link", { name: /Sleep/ })).toBeVisible();
});

it("opens Counter and Curry from their Closures category", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Closures" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.getByRole("link", { name: "Counter" })).toHaveAttribute(
    "href",
    "/javascript/practice/counter",
  );
  expect(screen.queryByRole("link", { name: "Sleep" })).toBeNull();
  expect(screen.getByRole("link", { name: "Curry" })).toHaveAttribute(
    "href",
    "/javascript/practice/curry",
  );
  expect(screen.getByRole("status")).toHaveTextContent("4 problems");
});

it("opens Fibonacci Generator from Generators and searches within that category", () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  expect(
    screen.getByRole("link", { name: "Fibonacci Generator" }),
  ).toBeVisible();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Generators" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(
    screen.getByRole("link", { name: "Fibonacci Generator" }),
  ).toHaveAttribute("href", "/javascript/practice/fibonacci-generator");
  expect(screen.queryByRole("link", { name: "Counter" })).toBeNull();
  fireEvent.change(screen.getByRole("searchbox", { name: "Search problems" }), {
    target: { value: "yield" },
  });
  expect(screen.getByRole("status")).toHaveTextContent("1 problem");
});

it("filters by difficulty and clears filters without leaving the selected category", async () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Closures" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Difficulty" }), {
    key: "Enter",
  });
  fireEvent.click(await screen.findByRole("option", { name: "Hard" }));
  expect(screen.getByText("No problems match your filters.")).toBeVisible();
  expect(screen.queryByRole("link", { name: "Counter" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(screen.getByRole("tab", { name: "Closures" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(screen.getByRole("link", { name: "Counter" })).toBeVisible();
});

it("toggles account flags without navigating and isolates learners", async () => {
  let owner = "flags-owner-a";
  const flags = new Map<string, boolean>();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "PATCH")
        flags.set(owner, JSON.parse(init.body as string).flagged);
      const record = {
        problemId: "javascript.counter",
        flagged: flags.get(owner) ?? false,
        solvedAt: null,
        legacyCompleted: false,
      };
      return Response.json(
        init?.method === "PATCH" ? { record } : { records: [record] },
      );
    }),
  );
  const ownerA = "flags-owner-a";
  const ownerB = "flags-owner-b";
  const view = render(
    <JavaScriptPractice
      catalog={javascriptPracticeCatalog}
      learnerId={ownerA}
    />,
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Flag Counter" })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Flag Counter" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Unflag Counter" }),
    ).toBeEnabled(),
  );
  expect(
    screen.getByRole("button", { name: "Unflag Counter" }),
  ).toHaveAttribute("aria-pressed", "true");
  owner = ownerB;
  view.rerender(
    <JavaScriptPractice
      catalog={javascriptPracticeCatalog}
      learnerId={ownerB}
    />,
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Flag Counter" })).toBeEnabled(),
  );
  expect(screen.getByRole("button", { name: "Flag Counter" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  owner = ownerA;
  view.rerender(
    <JavaScriptPractice
      catalog={javascriptPracticeCatalog}
      learnerId={ownerA}
    />,
  );
  expect(
    screen.getByRole("button", { name: "Unflag Counter" }),
  ).toHaveAttribute("aria-pressed", "true");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Unflag Counter" }),
    ).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Unflag Counter" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Flag Counter" })).toBeEnabled(),
  );
});

it("retains legacy browser completion without claiming verified account solved", async () => {
  const owner = "legacy-import-ui-test";
  localStorage.setItem(
    `code-atlas:practice:${owner}:v1`,
    JSON.stringify({ version: 1, flagged: [], solved: ["javascript.counter"] }),
  );
  const fetch = vi.fn(async (_url: string) =>
    Response.json({
      records: [
        {
          problemId: "javascript.counter",
          flagged: false,
          solvedAt: null,
          legacyCompleted: true,
        },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetch);
  render(
    <JavaScriptPractice
      catalog={javascriptPracticeCatalog}
      learnerId={owner}
    />,
  );
  await screen.findByRole("img", {
    name: "Counter: previous browser completion, unverified",
  });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Flag Counter" })).toBeEnabled(),
  );
  expect(
    screen.queryByRole("img", { name: "Counter: solved in your account" }),
  ).toBeNull();
  expect(fetch.mock.calls[0]?.[0]).toBe("/api/practice-progress/import");
  expect(localStorage.getItem(`code-atlas:practice:${owner}:v1`)).toContain(
    "javascript.counter",
  );
});

it("retains an offline flag and retries account synchronization", async () => {
  let available = false,
    flagged = false;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init?: RequestInit) => {
      if (!available) throw new Error("offline");
      if (init?.method === "PATCH")
        flagged = JSON.parse(init.body as string).flagged;
      const record = {
        problemId: "javascript.sleep",
        flagged,
        solvedAt: null,
        legacyCompleted: false,
      };
      return Response.json(
        init?.method === "PATCH" ? { record } : { records: [record] },
      );
    }),
  );
  render(
    <JavaScriptPractice
      catalog={javascriptPracticeCatalog}
      learnerId="offline-flag-ui-test"
    />,
  );
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Flag Sleep" }));
  await screen.findByText(/Flag kept in this browser/);
  expect(screen.getByRole("button", { name: "Unflag Sleep" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  available = true;
  fireEvent.click(screen.getByRole("button", { name: "Retry progress" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  expect(flagged).toBe(true);
  expect(screen.getByRole("button", { name: "Unflag Sleep" })).toHaveAttribute(
    "title",
    "Flagged in your account — click to unflag",
  );
});

it("finds Flatten Nested Array under Arrays and intersects search with Medium", async () => {
  render(<JavaScriptPractice catalog={javascriptPracticeCatalog} />);
  expect(
    screen.getByRole("link", { name: "Flatten Nested Array" }),
  ).toBeVisible();
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Arrays" }), {
    button: 0,
    ctrlKey: false,
  });
  expect(screen.getByRole("status")).toHaveTextContent("5 problems");
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Difficulty" }), {
    key: "Enter",
  });
  fireEvent.click(await screen.findByRole("option", { name: "Medium" }));
  fireEvent.change(screen.getByRole("searchbox", { name: "Search problems" }), {
    target: { value: "nested" },
  });
  expect(
    screen.getByRole("link", { name: "Flatten Nested Array" }),
  ).toHaveAttribute("href", "/javascript/practice/flatten-nested-array");
  expect(
    screen.queryByRole("link", { name: "Filter Elements from Array" }),
  ).toBeNull();
  expect(screen.getByRole("status")).toHaveTextContent("1 problem");
});
