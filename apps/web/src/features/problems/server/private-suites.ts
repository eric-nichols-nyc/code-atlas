import "server-only";
import type {
  NestedArray,
  ProblemDefinition,
  ProblemInput,
} from "@workspace/problems";
// These inputs are server-only. Public content contains examples, never full suites.
export const privateSuites: Record<ProblemDefinition["kind"], ProblemInput[]> =
  {
    "map-array": [
      { arr: [], transform: "double" },
      { arr: [0, -1, 2, -10000, 10000], transform: "square" },
      { arr: [9, 9, 9, 9], transform: "addIndex" },
      { arr: [3, 0, -5], transform: "zero" },
      { arr: [-7, 0, 12], transform: "negate" },
      {
        arr: Array.from({ length: 1000 }, (_, i) => i - 500),
        transform: "addIndex",
      },
      { arr: [0], transform: "double" },
      { arr: [1, 2, 3], transform: "double" },
    ],
    "reduce-array": [
      { nums: [], reducer: "sum", init: 42 },
      { nums: [0], reducer: "subtract", init: 0 },
      { nums: [1, 4, -2, 10], reducer: "subtract", init: 100 },
      { nums: [-10, -3, -20], reducer: "max", init: -100 },
      { nums: [0, -2, 3, 4, 7], reducer: "countEven", init: 5 },
      { nums: [10000, -10000, 0], reducer: "sum", init: -1000000000 },
      {
        nums: Array.from({ length: 1000 }, (_, i) => i - 500),
        reducer: "sum",
        init: 1000000000,
      },
      { nums: [], reducer: "max", init: -1000000000 },
    ],
    "chunk-array": [
      { arr: [], size: 1 },
      { arr: [0], size: 1000 },
      { arr: [1, 2, 3, 4, 5], size: 2 },
      { arr: [1, 2, 3, 4], size: 2 },
      { arr: [7, 7, -1, 0, -1], size: 1 },
      { arr: [-1000000000, 1000000000], size: 3 },
      { arr: Array.from({ length: 1000 }, (_, i) => i - 500), size: 17 },
      { arr: Array.from({ length: 1000 }, (_, i) => i), size: 1000 },
    ],
    "function-composition": [
      { functions: [], x: 0 },
      { functions: [], x: -10000 },
      { functions: ["double", "addOne"], x: 3 },
      { functions: ["addOne", "double"], x: 3 },
      { functions: ["negate", "addOne", "double"], x: -5 },
      { functions: ["negate", "negate"], x: 0 },
      {
        functions: Array.from({ length: 10 }, () => "double" as const),
        x: 10000,
      },
      { functions: ["addOne"], x: -1 },
    ],
    memoize: [
      { fn: "sum", calls: [] },
      { fn: "sum", calls: [[], [], [0], [0]] },
      { fn: "sum", calls: [[1, 2], [12], [1, 2], [1, 2, 0]] },
      { fn: "product", calls: [[0, 7], [0, 7], [], [], [-2, 3]] },
      {
        fn: "subtract",
        calls: [
          [5, 2],
          [2, 5],
          [5, 2],
          [0, 0],
          [0, 0],
        ],
      },
      {
        fn: "sum",
        calls: [
          [-100, 100],
          [100, -100],
          [-100, 100],
        ],
      },
      {
        fn: "product",
        calls: [
          [100, 100, 100, 100],
          [-100, 100, -100, 100],
        ],
      },
      { fn: "sum", calls: Array.from({ length: 100 }, (_, i) => [i % 5, 0]) },
    ],
    delay: [1, 15, 40, 125, 333, 500, 750, 1000],
    "delay-all": [
      {
        ms: 0,
        functions: [
          { t: 0, value: 0 },
          { t: 0, value: -1 },
        ],
      },
      {
        ms: 50,
        functions: [
          { t: 0, value: 9 },
          { t: 1000, value: 4 },
        ],
      },
      {
        ms: 1000,
        functions: [
          { t: 1000, value: 1000000000 },
          { t: 1, value: -1000000000 },
        ],
      },
      {
        ms: 100,
        functions: [
          { t: 50, value: 3 },
          { t: 25, value: 3 },
          { t: 50, value: 3 },
        ],
      },
      { ms: 300, functions: [] },
      {
        ms: 1,
        functions: Array.from({ length: 10 }, (_, i) => ({
          t: 1000 - i * 100,
          value: i - 5,
        })),
      },
      {
        ms: 120,
        functions: [
          { t: 30, value: 5 },
          { t: 30, value: 8 },
          { t: 30, value: -20 },
        ],
      },
    ],
    counter: [
      { n: 0, calls: 1 },
      { n: 1, calls: 0 },
      { n: -1000, calls: 6 },
      { n: 1000, calls: 5 },
      { n: 17, calls: 1000 },
      { n: -1, calls: 3 },
      { n: 10, calls: 4 },
      { n: 0, calls: 5 },
    ],
    curry: [
      { fn: "identity", groups: [[-9, 4]] },
      { fn: "constant", groups: [[]] },
      { fn: "subtract3", groups: [[20], [], [3], [2]] },
      { fn: "sum3", groups: [[-10, 4], [6]] },
      { fn: "countArgs", groups: [[1], [2, 3, 4, 5]] },
      { fn: "product4", groups: [[-2], [0, 3], [4]] },
      { fn: "sum3", groups: [[1, 2, 3, 1000]] },
      { fn: "sum3", groups: [[], [], [7], [], [-8, 9]] },
    ],
    "fibonacci-generator": [
      { count: 1 },
      { count: 2 },
      { count: 3 },
      { count: 13 },
      { count: 25 },
      { count: 50 },
    ],
    debounce: [
      {
        t: 0,
        calls: [
          { t: 0, inputs: [1] },
          { t: 0, inputs: [2] },
        ],
      },
      {
        t: 1000,
        calls: [
          { t: 0, inputs: [9] },
          { t: 1000, inputs: [4] },
        ],
      },
      {
        t: 50,
        calls: [
          { t: 0, inputs: [1] },
          { t: 49, inputs: [2] },
          { t: 98, inputs: [3] },
        ],
      },
      {
        t: 25,
        calls: [
          { t: 100, inputs: [] },
          { t: 10, inputs: [-1, 0, 8] },
        ],
      },
      { t: 1, calls: [{ t: 0, inputs: [0] }] },
      {
        t: 10,
        calls: Array.from({ length: 10 }, (_, i) => ({
          t: i * 5,
          inputs: [i],
        })),
      },
      {
        t: 30,
        calls: [
          { t: 0, inputs: [1, 2, 3] },
          { t: 80, inputs: [4, 5, 6] },
        ],
      },
    ],
    "filter-array": [
      { arr: [], predicate: "firstIndex" },
      { arr: [-10, -5, 0, 10], predicate: "greaterThan10" },
      { arr: [9, 9, 9, 9, 9], predicate: "evenIndex" },
      { arr: [-1000000000, 1000000000, 0, -1, 1], predicate: "isPositive" },
      { arr: [0, -3, 0, 4], predicate: "isTruthy" },
      { arr: [1, 2, 3], predicate: "alwaysFalse" },
      {
        arr: Array.from({ length: 1000 }, (_, i) => i - 500),
        predicate: "plusOne",
      },
    ],
    "flatten-array": [
      { arr: [0, [-2, 0], [5, [-2]]] },
      { arr: [[], [[]], [[[]]]] },
      { arr: [7, 7, -1, 0] },
      { arr: [[1000000000], [-1000000000]] },
      { arr: [9, [3, [8, 3]], 1] },
      {
        arr: Array.from({ length: 19 }).reduce<NestedArray>(
          (arr) => [arr],
          [-3, 0, 2],
        ),
      },
      { arr: Array.from({ length: 999 }, (_, i) => (i % 11) - 5) },
      {
        arr: [
          [
            [[], 4],
            [[], [4, 0]],
          ],
          [],
          -7,
        ],
      },
    ],
  };
