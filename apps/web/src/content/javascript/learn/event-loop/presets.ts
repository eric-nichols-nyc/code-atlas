import type { EventLoopPreset } from "@/features/learning/lib/event-loop-visualization";
import { complexEventLoopVisualization } from "./complex-visualization";
import { eventLoopVisualization } from "./visualization";

export const eventLoopPresets = [
  { label: "Easy", definition: eventLoopVisualization },
  { label: "Complex", definition: complexEventLoopVisualization },
] as const satisfies readonly [EventLoopPreset, ...EventLoopPreset[]];
