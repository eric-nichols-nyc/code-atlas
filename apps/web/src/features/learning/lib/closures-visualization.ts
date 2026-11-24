import type {
  CodeWalkthroughDefinition,
  CodeWalkthroughStep,
  PreparedWalkthrough,
} from "./code-walkthrough";

export type MeterName = "desk" | "door";

type ClosureFrame =
  | { readonly kind: "script" }
  | { readonly kind: "factory"; readonly meter: MeterName }
  | {
      readonly kind: "add";
      readonly meter: MeterName;
      readonly amount: number;
    };

type ClosureStep = CodeWalkthroughStep & {
  readonly frame: ClosureFrame;
  readonly totals: Readonly<Partial<Record<MeterName, number>>>;
  readonly log?: number;
};

export type ClosuresVisualizationDefinition = Omit<
  CodeWalkthroughDefinition,
  "steps"
> & {
  readonly steps: readonly [ClosureStep, ...ClosureStep[]];
};

export type PreparedClosuresVisualization = Omit<
  ClosuresVisualizationDefinition,
  "source"
> &
  Pick<PreparedWalkthrough, "codeLines">;
