import type { ClosuresVisualizationDefinition } from "../../../../features/learning/lib/closures-visualization";

const script = { kind: "script" } as const;
const desk = { kind: "add", meter: "desk", amount: 2 } as const;
const bothMeters = { desk: 10, door: 30 };
const deskUpdated = { ...bothMeters, desk: 12 };
const doorUpdated = { ...deskUpdated, door: 35 };
const finalTotals = { ...doorUpdated, desk: 15 };

export const closuresVisualization: ClosuresVisualizationDefinition = {
  id: "closures-independent-meters",
  title: "Closures",
  source: `function makeMeter(total) {
  return function add(amount) {
    total += amount;
    return total;
  };
}

const desk = makeMeter(10);
const door = makeMeter(30);

console.log(desk(2));
console.log(door(5));
console.log(desk(3));`,
  steps: [
    {
      id: "start",
      lines: [8],
      frame: script,
      totals: {},
      explanation: "The script is about to create the desk meter.",
    },
    {
      id: "open-desk-scope",
      lines: [1, 8],
      frame: { kind: "factory", meter: "desk" },
      totals: { desk: 10 },
      explanation:
        "The first makeMeter call has a new local total binding initialized to 10.",
    },
    {
      id: "return-desk",
      lines: [2, 8],
      frame: script,
      totals: { desk: 10 },
      explanation:
        "makeMeter returns add and its frame leaves the stack. The function stored in desk still has access to total.",
    },
    {
      id: "open-door-scope",
      lines: [1, 9],
      frame: { kind: "factory", meter: "door" },
      totals: bothMeters,
      explanation:
        "Calling makeMeter again creates a separate environment with its own total, initialized to 30.",
    },
    {
      id: "return-door",
      lines: [2, 9],
      frame: script,
      totals: bothMeters,
      explanation:
        "The function stored in door keeps access to the second total. Both factories have now returned.",
    },
    {
      id: "call-desk",
      lines: [2, 11],
      frame: desk,
      totals: bothMeters,
      explanation:
        "desk(2) pushes add onto the stack. Lexical lookup finds total in the desk meter’s saved environment.",
    },
    {
      id: "update-desk",
      lines: [3, 11],
      frame: desk,
      totals: deskUpdated,
      explanation:
        "The update changes desk’s total from 10 to 12. The door meter still holds 30.",
    },
    {
      id: "log-desk",
      lines: [4, 11],
      frame: script,
      totals: deskUpdated,
      log: 12,
      explanation:
        "add returns 12 to console.log. The call ends, and desk keeps its updated total.",
    },
    {
      id: "update-door",
      lines: [3, 12],
      frame: { kind: "add", meter: "door", amount: 5 },
      totals: doorUpdated,
      explanation: "door(5) updates its own captured total, from 30 to 35.",
    },
    {
      id: "log-door",
      lines: [4, 12],
      frame: script,
      totals: doorUpdated,
      log: 35,
      explanation:
        "The second call logs 35. The two meters still use separate bindings.",
    },
    {
      id: "update-desk-again",
      lines: [3, 13],
      frame: { kind: "add", meter: "desk", amount: 3 },
      totals: finalTotals,
      explanation:
        "desk(3) reads the same binding that last held 12, then adds 3.",
    },
    {
      id: "log-final",
      lines: [4, 13],
      frame: script,
      totals: finalTotals,
      log: 15,
      explanation:
        "The final call logs 15. The desk meter ends at 15 and the door meter at 35.",
    },
  ],
};
