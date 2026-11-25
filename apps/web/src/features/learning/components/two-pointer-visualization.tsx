import {
  type TwoPointerVisualizationDefinition,
  validateTwoPointerVisualization,
} from "../lib/two-pointer-visualization";
import { TwoPointerVisualizationClient } from "./two-pointer-visualization-client";

export function TwoPointerVisualization({
  definition,
}: {
  definition: TwoPointerVisualizationDefinition;
}) {
  if (validateTwoPointerVisualization(definition).length)
    return <p>Palindrome visualization unavailable.</p>;
  return (
    <TwoPointerVisualizationClient
      key={definition.id}
      definition={definition}
    />
  );
}
