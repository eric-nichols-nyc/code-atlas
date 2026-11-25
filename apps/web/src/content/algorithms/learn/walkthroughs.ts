import { slidingWindowWalkthrough } from "@/content/shared/learn/sliding-window/walkthrough";
import { twoPointersVisualization } from "@/content/shared/learn/two-pointers/visualization";
import { twoPointersWalkthrough } from "@/content/shared/learn/two-pointers/walkthrough";

export const learningVisualizations = [twoPointersVisualization] as const;

export const learningWalkthroughs = [
  { moduleSlug: "two-pointers", walkthrough: twoPointersWalkthrough },
  { moduleSlug: "sliding-window", walkthrough: slidingWindowWalkthrough },
] as const;
