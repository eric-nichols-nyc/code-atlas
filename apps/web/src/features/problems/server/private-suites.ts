import "server-only";
import type { ProblemDefinition, ProblemInput } from "@workspace/problems";
// These inputs are server-only. Public content contains examples, never full suites.
export const privateSuites: Record<ProblemDefinition["kind"], ProblemInput[]> =
  {
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
  };
