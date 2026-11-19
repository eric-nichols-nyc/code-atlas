import "server-only";
export interface AiLimiter {
  acquire(learner: string): Promise<(() => Promise<void>) | null>;
}
// One admission budget across AI capabilities in this Node process.
// Replicated deployments must replace this with shared admission accounting.
export function createAiLimiter(now = Date.now) {
  const entries = new Map<
    string,
    { start: number; count: number; active: boolean }
  >();
  let active = 0;
  return {
    async acquire(learner: string): Promise<(() => Promise<void>) | null> {
      const time = now();
      for (const [id, entry] of entries)
        if (!entry.active && time - entry.start >= 60000) entries.delete(id);
      let entry = entries.get(learner);
      if (entry?.active || active >= 4) return null;
      if (!entry || time - entry.start >= 60000) {
        entry = { start: time, count: 0, active: false };
        entries.set(learner, entry);
      }
      if (entry.count >= 10) return null;
      entry.count++;
      entry.active = true;
      active++;
      let released = false;
      return async () => {
        if (released) return;
        released = true;
        entry.active = false;
        active--;
      };
    },
    get size() {
      return entries.size;
    },
  };
}

// Next can bundle routes separately; process-wide state must survive those copies.
const scope = globalThis as typeof globalThis & {
  codeAtlasAiAdmission?: AiLimiter;
};
if (!scope.codeAtlasAiAdmission) scope.codeAtlasAiAdmission = createAiLimiter();
export const aiAdmission = scope.codeAtlasAiAdmission;
