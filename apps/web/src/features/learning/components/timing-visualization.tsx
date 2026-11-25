import type {
  PreparedTimingVisualization,
  TimingVisualizationDefinition,
} from "../lib/timing-visualization";
import { prepareCodeSource } from "../server/prepare-code-walkthrough";
import { TimingVisualizationClient } from "./timing-visualization-client";

function prepareExample({
  source,
  ...definition
}: TimingVisualizationDefinition): PreparedTimingVisualization {
  return { ...definition, codeLines: prepareCodeSource(source).codeLines };
}

export function TimingVisualization({
  examples: [debounce, throttle],
}: {
  examples: readonly [
    TimingVisualizationDefinition,
    TimingVisualizationDefinition,
  ];
}) {
  return (
    <TimingVisualizationClient
      examples={[prepareExample(debounce), prepareExample(throttle)]}
    />
  );
}
