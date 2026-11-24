import type {
  HeapStackVisualizationDefinition,
  MemoryFrame,
} from "../../../../features/learning/lib/heap-stack-visualization";

const script = { id: "script", title: "Script", bindings: {} };
const object = { id: "Object 1", properties: { count: 3 } };
const updatedObject = { ...object, properties: { count: 5 } };
const reference = { objectId: object.id };
const run = { id: "run", title: "run()", bindings: { count: 1 } };
const runWithObject = {
  ...run,
  bindings: { ...run.bindings, original: reference },
};
const runWithAlias = {
  ...runWithObject,
  bindings: { ...runWithObject.bindings, alias: reference },
};

function incrementFrame(count: number): MemoryFrame {
  return {
    id: "increment",
    title: "increment()",
    bindings: { item: reference, count },
  };
}

const innerOutput = ["2 5"];
const finalOutput = [...innerOutput, "1 5"];

export const heapStackVisualization: HeapStackVisualizationDefinition = {
  id: "heap-stack-shared-object",
  title: "Heap & Stack Visualizer",
  source: `function increment(item, count) {
  count += 1;
  item.count += count;
  console.log(count, item.count);
}

function run() {
  const count = 1;
  const original = { count: 3 };
  const alias = original;
  increment(alias, count);
  console.log(count, original.count);
}

run();`,
  steps: [
    {
      id: "start",
      lines: [15],
      explanation:
        "The script is about to call run(). The stack shows where execution is now.",
      stack: [script],
      heap: [],
      output: [],
    },
    {
      id: "enter-run",
      lines: [8],
      explanation:
        "Calling run() pushes its frame onto the stack. Its local count holds the number 1.",
      stack: [run, script],
      heap: [],
      output: [],
    },
    {
      id: "allocate-object",
      lines: [9],
      explanation:
        "The object literal creates Object 1. The local binding original holds a reference to it.",
      stack: [runWithObject, script],
      heap: [object],
      output: [],
    },
    {
      id: "copy-reference",
      lines: [10],
      explanation:
        "Assigning original to alias copies the reference. Both names now point to the same object.",
      stack: [runWithAlias, script],
      heap: [object],
      output: [],
    },
    {
      id: "enter-increment",
      lines: [1, 11],
      explanation:
        "Calling increment() pushes another frame. The item parameter gets a copy of the object reference, and count gets a copy of the number 1.",
      stack: [incrementFrame(1), runWithAlias, script],
      heap: [object],
      output: [],
    },
    {
      id: "increment-number",
      lines: [2],
      explanation:
        "Changing the inner count to 2 leaves run()'s count at 1. Each frame has its own local binding.",
      stack: [incrementFrame(2), runWithAlias, script],
      heap: [object],
      output: [],
    },
    {
      id: "mutate-object",
      lines: [3],
      explanation:
        "Updating item.count adds 2 to Object 1's count. Every binding that points to Object 1 now sees 5.",
      stack: [incrementFrame(2), runWithAlias, script],
      heap: [updatedObject],
      output: [],
    },
    {
      id: "log-inner",
      lines: [4],
      explanation:
        "Inside increment(), the local count is 2 and the shared object's count is 5.",
      stack: [incrementFrame(2), runWithAlias, script],
      heap: [updatedObject],
      output: innerOutput,
    },
    {
      id: "return-to-run",
      lines: [5, 11],
      explanation:
        "Returning removes the increment() frame. The object is still reachable through original and alias in run().",
      stack: [runWithAlias, script],
      heap: [updatedObject],
      output: innerOutput,
    },
    {
      id: "log-caller",
      lines: [12],
      explanation:
        "Back in run(), the local count is still 1. Reading original.count gives 5 because original points to the shared object.",
      stack: [runWithAlias, script],
      heap: [updatedObject],
      output: finalOutput,
    },
    {
      id: "return-to-script",
      lines: [13, 15],
      explanation:
        "The run() frame is removed. Its references disappear, so Object 1 is now eligible for garbage collection.",
      stack: [script],
      heap: [updatedObject],
      output: finalOutput,
    },
    {
      id: "finish",
      lines: [15],
      explanation:
        "The script finishes and the stack empties. Object 1 remains visible here to show that reachability and the timing of collection are separate.",
      stack: [],
      heap: [updatedObject],
      output: finalOutput,
    },
  ],
};
