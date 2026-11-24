import type { GeneratorVisualizationDefinition } from "../lib/generator-visualization";
import { prepareCodeSource } from "../server/prepare-code-walkthrough";
import { GeneratorVisualizationClient } from "./generator-visualization-client";

export function GeneratorVisualization({
  definition: { source, ...definition },
}: {
  definition: GeneratorVisualizationDefinition;
}) {
  const { codeLines } = prepareCodeSource(source);
  return (
    <GeneratorVisualizationClient example={{ ...definition, codeLines }} />
  );
}
