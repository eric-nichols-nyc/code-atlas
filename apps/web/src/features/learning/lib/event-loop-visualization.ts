import {
  type CodeWalkthroughDefinition,
  type CodeWalkthroughStep,
  type PreparedWalkthrough,
  validateCodeWalkthrough,
} from "./code-walkthrough";

const phases = [
  "Script task",
  "Microtask checkpoint",
  "Timer task",
  "Idle",
] as const;
const lanes = [
  "stack",
  "pendingTimers",
  "microtasks",
  "timerTasks",
  "output",
] as const;

type EventLoopStep = CodeWalkthroughStep &
  Readonly<Record<(typeof lanes)[number], readonly string[]>> & {
    readonly phase: (typeof phases)[number];
  };

export type EventLoopVisualizationDefinition = Omit<
  CodeWalkthroughDefinition,
  "steps"
> & {
  readonly steps: readonly [EventLoopStep, ...EventLoopStep[]];
  readonly predictionOrder?: readonly number[];
};

export type EventLoopPreset = {
  readonly label: string;
  readonly definition: EventLoopVisualizationDefinition;
};

export type PreparedEventLoopPreset = Pick<EventLoopPreset, "label"> &
  Pick<EventLoopVisualizationDefinition, "id" | "steps" | "predictionOrder"> &
  Pick<PreparedWalkthrough, "codeLines">;

export function validateEventLoopVisualization(
  definition: EventLoopVisualizationDefinition,
) {
  const errors = validateCodeWalkthrough(
    definition,
    "Event loop visualization",
  );
  if (errors.length) return errors;

  for (const step of definition.steps) {
    const label = `Event loop visualization ${definition.id}, step ${step.id}`;
    if (!phases.includes(step.phase)) errors.push(`${label}: invalid phase.`);
    for (const lane of lanes) {
      const items = step[lane];
      if (
        !Array.isArray(items) ||
        items.some((item) => typeof item !== "string" || !item.trim())
      ) {
        errors.push(`${label}: invalid ${lane} entries.`);
      }
    }
  }

  const { predictionOrder } = definition;
  const output = definition.steps.at(-1)?.output;
  if (predictionOrder !== undefined && errors.length === 0 && output) {
    if (
      !Array.isArray(predictionOrder) ||
      predictionOrder.length !== output.length ||
      new Set(predictionOrder).size !== output.length ||
      !predictionOrder.every(
        (index) =>
          Number.isInteger(index) && index >= 0 && index < output.length,
      )
    ) {
      errors.push(
        `${definition.id}: prediction must include every final log once.`,
      );
    } else if (
      predictionOrder.every(
        (index, position) => output[index] === output[position],
      )
    ) {
      errors.push(
        `${definition.id}: prediction must start in a different order.`,
      );
    }
  }
  return errors;
}
