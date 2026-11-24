import type {
  CodeWalkthroughDefinition,
  CodeWalkthroughStep,
  PreparedWalkthrough,
} from "./code-walkthrough";

export type MemoryFrame = {
  readonly id: string;
  readonly title: string;
  readonly bindings: Readonly<Record<string, number | { objectId: string }>>;
};

type HeapObject = {
  readonly id: string;
  readonly properties: Readonly<Record<string, number>>;
};

type HeapStackStep = CodeWalkthroughStep & {
  readonly stack: readonly MemoryFrame[];
  readonly heap: readonly HeapObject[];
  readonly output: readonly string[];
};

export type HeapStackVisualizationDefinition = Omit<
  CodeWalkthroughDefinition,
  "steps"
> & {
  readonly steps: readonly [HeapStackStep, ...HeapStackStep[]];
};

export type PreparedHeapStackVisualization = Omit<
  HeapStackVisualizationDefinition,
  "source"
> &
  Pick<PreparedWalkthrough, "codeLines">;
