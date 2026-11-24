import type {
  EventLoopPreset,
  PreparedEventLoopPreset,
} from "../lib/event-loop-visualization";
import { prepareCodeSource } from "../server/prepare-code-walkthrough";
import { EventLoopVisualizationClient } from "./event-loop-visualization-client";

function preparePreset({
  label,
  definition,
}: EventLoopPreset): PreparedEventLoopPreset {
  return {
    label,
    id: definition.id,
    steps: definition.steps,
    predictionOrder: definition.predictionOrder,
    codeLines: prepareCodeSource(definition.source).codeLines,
  };
}

export function EventLoopVisualization({
  presets: [first, ...rest],
}: {
  presets: readonly [EventLoopPreset, ...EventLoopPreset[]];
}) {
  return (
    <EventLoopVisualizationClient
      title={first.definition.title}
      presets={[preparePreset(first), ...rest.map(preparePreset)]}
    />
  );
}
