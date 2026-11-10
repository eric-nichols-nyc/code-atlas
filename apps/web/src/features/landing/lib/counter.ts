/** Fixed public example only; learner-provided source is never evaluated here. */
export function createDemoCounter(start: number) {
  let count = start;
  return () => count++;
}

export const counterStarts = [10, 0, -2] as const;
