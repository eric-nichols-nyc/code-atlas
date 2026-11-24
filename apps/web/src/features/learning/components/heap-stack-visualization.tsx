import type { HeapStackVisualizationDefinition } from "../lib/heap-stack-visualization";
import { prepareCodeSource } from "../server/prepare-code-walkthrough";
import { HeapStackVisualizationClient } from "./heap-stack-visualization-client";

export function HeapStackVisualization({
  definition: { source, ...definition },
}: {
  definition: HeapStackVisualizationDefinition;
}) {
  const { codeLines } = prepareCodeSource(source);
  return (
    <HeapStackVisualizationClient example={{ ...definition, codeLines }} />
  );
}
