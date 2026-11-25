import type {
  CodeWalkthroughDefinition,
  CodeWalkthroughStep,
  PreparedWalkthrough,
} from "./code-walkthrough";

type TimingEvent = {
  readonly kind: "input" | "skipped" | "callback" | "window";
  readonly detail: string;
};

type TimingStep = CodeWalkthroughStep & {
  readonly time: number;
  readonly deadline?: number;
  readonly pending?: string;
  readonly events?: readonly TimingEvent[];
};

export type TimingVisualizationDefinition = Omit<
  CodeWalkthroughDefinition,
  "steps"
> & {
  readonly label: "Debounce" | "Throttle";
  readonly steps: readonly [TimingStep, ...TimingStep[]];
};

export type PreparedTimingVisualization = Omit<
  TimingVisualizationDefinition,
  "source"
> &
  Pick<PreparedWalkthrough, "codeLines">;
