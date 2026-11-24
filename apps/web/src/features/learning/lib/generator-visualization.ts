import type {
  CodeWalkthroughDefinition,
  CodeWalkthroughStep,
  PreparedWalkthrough,
} from "./code-walkthrough";

export type GeneratorResult =
  | { readonly value: number; readonly done: false }
  | { readonly value: string | undefined; readonly done: true };

type GeneratorStep = CodeWalkthroughStep & {
  readonly phase:
    | "not-created"
    | "ready"
    | "running"
    | "suspended"
    | "completed";
  readonly location: string;
  readonly locals?: Readonly<Record<string, number>>;
  readonly call?: {
    readonly expression: string;
    readonly line: number;
    readonly transition: string;
    readonly result?: GeneratorResult;
  };
};

export type GeneratorVisualizationDefinition = Omit<
  CodeWalkthroughDefinition,
  "steps"
> & {
  readonly steps: readonly [GeneratorStep, ...GeneratorStep[]];
};

export type PreparedGeneratorVisualization = Omit<
  GeneratorVisualizationDefinition,
  "source"
> &
  Pick<PreparedWalkthrough, "codeLines">;
