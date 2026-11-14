import { twoPointersVisualization } from "./two-pointers/visualization";
import { twoPointersWalkthrough } from "./two-pointers/walkthrough";

export const learningVisualizations = [twoPointersVisualization] as const;

export const learningWalkthroughs = [
  { moduleSlug: "two-pointers", walkthrough: twoPointersWalkthrough },
] as const;
