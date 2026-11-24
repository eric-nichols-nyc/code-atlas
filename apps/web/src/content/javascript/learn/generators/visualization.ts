import type { GeneratorVisualizationDefinition } from "../../../../features/learning/lib/generator-visualization";

const firstCall = { expression: "cursor.next()", line: 10 };
const secondCall = { expression: "cursor.next(5)", line: 11 };
const thirdCall = { expression: "cursor.next()", line: 12 };
const fourthCall = { expression: "cursor.next()", line: 13 };
const afterAdvance = { position: 15, advance: 5 };

export const generatorVisualization: GeneratorVisualizationDefinition = {
  id: "generators-checkpoints",
  title: "Generators & Iterators",
  source: `function* checkpoints() {
  let position = 10;
  const advance = yield position;
  position += advance;
  yield position;
  return "complete";
}

const cursor = checkpoints();
console.log(cursor.next());
console.log(cursor.next(5));
console.log(cursor.next());
console.log(cursor.next());`,
  steps: [
    {
      id: "before-create",
      lines: [9],
      phase: "not-created",
      location: "Waiting for checkpoints()",
      explanation:
        "The script is about to call checkpoints() to create a generator.",
    },
    {
      id: "create",
      lines: [9],
      phase: "ready",
      location: "Before the first body line",
      explanation:
        "Calling checkpoints() returns the generator object. Its body waits for the first next() call.",
    },
    {
      id: "enter",
      lines: [2, 10],
      phase: "running",
      location: "Line 2",
      locals: { position: 10 },
      call: { ...firstCall, transition: "Starts at the top of the body" },
      explanation:
        "The first next() starts the body and initializes position to 10.",
    },
    {
      id: "yield-first",
      lines: [3, 10],
      phase: "suspended",
      location: "Paused at yield on line 3",
      locals: { position: 10 },
      call: {
        ...firstCall,
        transition: "Yields 10 and pauses",
        result: { value: 10, done: false },
      },
      explanation:
        "The first yield sends 10 to the caller. The generator pauses with position still set to 10.",
    },
    {
      id: "resume-with-argument",
      lines: [3, 11],
      phase: "running",
      location: "Resumed at yield on line 3",
      locals: { position: 10, advance: 5 },
      call: {
        ...secondCall,
        transition: "The paused yield expression evaluates to 5",
      },
      explanation:
        "Calling next(5) resumes the suspended yield. Its result is 5, which initializes advance.",
    },
    {
      id: "update-local",
      lines: [4, 11],
      phase: "running",
      location: "Line 4",
      locals: afterAdvance,
      call: { ...secondCall, transition: "Adds 5 to the saved position" },
      explanation:
        "The generator adds advance to the saved position, changing it from 10 to 15.",
    },
    {
      id: "yield-second",
      lines: [5, 11],
      phase: "suspended",
      location: "Paused at yield on line 5",
      locals: afterAdvance,
      call: {
        ...secondCall,
        transition: "Yields 15 and pauses again",
        result: { value: 15, done: false },
      },
      explanation:
        "The second yield sends 15 to the caller. The generator is suspended again and can still resume.",
    },
    {
      id: "resume-to-return",
      lines: [6, 12],
      phase: "running",
      location: "Line 6",
      locals: afterAdvance,
      call: { ...thirdCall, transition: "Resumes after the second yield" },
      explanation:
        "The third next() resumes the body and reaches the return statement.",
    },
    {
      id: "return",
      lines: [6, 12],
      phase: "completed",
      location: "Finished at return on line 6",
      call: {
        ...thirdCall,
        transition: 'Returns "complete" and finishes',
        result: { value: "complete", done: true },
      },
      explanation:
        'The return sends "complete" in the result and marks the generator done.',
    },
    {
      id: "call-after-completion",
      lines: [13],
      phase: "completed",
      location: "No resumption point",
      call: {
        ...fourthCall,
        transition: "The body stays finished",
        result: { value: undefined, done: true },
      },
      explanation:
        "Another next() call returns undefined with done set to true. The generator stays completed.",
    },
  ],
};
