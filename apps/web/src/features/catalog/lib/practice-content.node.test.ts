import { validAnagramProblem } from "@workspace/problems";
import { expect, it } from "vitest";
import { algorithmsPracticeCatalog } from "@/content/algorithms/practice/catalog";
import { validatePracticeContent } from "./practice-content";

const subject = {
  id: "algorithms",
  catalog: algorithmsPracticeCatalog,
  statementSlugs: ["valid-anagram"],
};
const read = async () => "A complete authored problem statement.";
it("accepts the registered Algorithms definition with false sample expectations", async () => {
  expect(
    await validatePracticeContent([subject], [validAnagramProblem], read),
  ).toEqual([]);
});
it("rejects duplicate global IDs, foreign subjects, missing statements and nonboolean samples", async () => {
  expect(
    await validatePracticeContent(
      [subject, subject],
      [validAnagramProblem],
      read,
    ),
  ).toContain("Duplicate global problem ID.");
  expect(
    await validatePracticeContent(
      [{ ...subject, id: "javascript" }],
      [validAnagramProblem],
      read,
    ),
  ).toContain("Missing or mismatched problem algorithms.valid-anagram");
  expect(
    await validatePracticeContent(
      [{ ...subject, statementSlugs: [] }],
      [validAnagramProblem],
      read,
    ),
  ).toContain("Missing or mismatched problem algorithms.valid-anagram");
  expect(
    await validatePracticeContent(
      [subject],
      [validAnagramProblem],
      async () => {
        throw new Error("missing");
      },
    ),
  ).toContain("Missing tutor statement algorithms.valid-anagram");
  expect(
    await validatePracticeContent(
      [subject],
      [
        {
          ...validAnagramProblem,
          samples: [
            {
              id: "bad",
              input: { s: "a", t: "a" },
              explanation: "Invalid expected type.",
              expected: 1,
            },
          ],
        },
      ],
      read,
    ),
  ).toContain("Invalid problem algorithms.valid-anagram");
});
