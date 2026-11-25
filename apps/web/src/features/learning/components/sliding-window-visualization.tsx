import {
  type SlidingWindowVisualizationDefinition,
  validateSlidingWindowVisualization,
} from "../lib/sliding-window-visualization";
import { SlidingWindowVisualizationClient } from "./sliding-window-visualization-client";

export function SlidingWindowVisualization({
  definition,
}: {
  definition: SlidingWindowVisualizationDefinition;
}) {
  if (validateSlidingWindowVisualization(definition).length)
    return <p>Sliding window visualization unavailable.</p>;

  return (
    <SlidingWindowVisualizationClient
      key={definition.id}
      definition={definition}
    />
  );
}
