import type { ProblemDefinition } from "../types.js";

export const majorityElementProblem: ProblemDefinition = {
  id: "javascript.majority-element",
  slug: "majority-element",
  subjectId: "javascript",
  topicId: "arrays",
  kind: "majority-element",
  inputError:
    "Use a JSON array of 1–1000 integers from -1e9 to 1e9, with one value appearing more than half the time.",
  title: "Majority Element",
  summary: "Find the value that occurs more than half the time in an array.",
  difficulty: "Easy",
  entryFunction: "majorityElement",
  starterCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function majorityElement(nums) {
  // Return the value that appears more than nums.length / 2 times.
}
`,
  samples: [
    {
      id: "sample-1",
      input: { nums: [4, 1, 4] },
      expected: 4,
      explanation: "4 occurs twice among three values, so it has a majority.",
    },
    {
      id: "sample-2",
      input: { nums: [2, 2, 3, 3, 3, 2, 2] },
      expected: 2,
      explanation:
        "2 occurs four times in an array of length seven. Three occurrences would not be enough.",
    },
    {
      id: "sample-3",
      input: { nums: [0] },
      expected: 0,
      explanation:
        "The only value is the majority, even when that value is zero.",
    },
  ],
  constraints: [
    "nums is an array of 1–1000 integers from -1e9 to 1e9 in this practice workspace.",
    "One value always occurs more than floor(nums.length / 2) times. Custom Run cases must satisfy this guarantee too.",
    "Return the majority value as a number, rather than its index or occurrence count.",
    "Follow-up: use O(n) time and O(1) extra space. Other correct approaches are accepted.",
  ],
  hints: [
    "A frequency map gives a straightforward solution. The threshold is strictly greater than half the array length.",
    "For constant extra space, consider cancelling pairs of different values. A strict majority cannot be completely cancelled.",
    "Keep a candidate and a balance. Choose a candidate whenever the balance is zero; matching values increase the balance and other values decrease it.",
  ],
  solution: `function majorityElement(nums) {
  let candidate;
  let balance = 0;
  for (const value of nums) {
    if (balance === 0) candidate = value;
    balance += value === candidate ? 1 : -1;
  }
  return candidate;
}`,
  solutionExplanation:
    "Boyer–Moore voting cancels pairs of different values. Because the majority outnumbers all other values combined, it remains as the final candidate. The balance represents uncancelled votes, not the candidate's total frequency. A verification pass is unnecessary because every valid input guarantees a majority. One traversal takes O(n) time and the candidate and balance use O(1) extra space.",
};
