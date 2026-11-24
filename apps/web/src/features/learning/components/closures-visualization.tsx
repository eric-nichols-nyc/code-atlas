import type { ClosuresVisualizationDefinition } from "../lib/closures-visualization";
import { prepareCodeSource } from "../server/prepare-code-walkthrough";
import { ClosuresVisualizationClient } from "./closures-visualization-client";

export function ClosuresVisualization({
  definition: { source, ...definition },
}: {
  definition: ClosuresVisualizationDefinition;
}) {
  const { codeLines } = prepareCodeSource(source);
  return <ClosuresVisualizationClient example={{ ...definition, codeLines }} />;
}
