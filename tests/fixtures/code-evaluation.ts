export const evaluationFixture = {
  rubricVersion: "1",
  summary:
    "A correct Boyer–Moore solution with optimal time and auxiliary space.",
  criteria: {
    correctness: {
      score: 4,
      explanation:
        "The candidate and count loop cancels different values; the guaranteed majority remains the final candidate.",
    },
    efficiency: {
      score: 3,
      explanation:
        "The loop visits each number once and keeps only candidate and count.",
    },
    quality: {
      score: 2,
      explanation: "The candidate and count names make the voting state clear.",
    },
    edgeCases: {
      score: 1,
      explanation:
        "The initial candidate handles a single element, negative values and a majority appearing late.",
    },
  },
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  improvements: [],
};

export const evaluationStream = (report: unknown = evaluationFixture) =>
  [
    { type: "start" },
    { type: "delta", text: JSON.stringify(report) },
    { type: "done" },
  ]
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join("");
