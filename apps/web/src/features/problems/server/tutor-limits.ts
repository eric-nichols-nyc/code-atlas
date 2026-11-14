import "server-only";
export function createTutorLimiter(now = Date.now) {
  const entries = new Map<
    string,
    { start: number; count: number; active: boolean }
  >();
  let active = 0;
  return {
    acquire(learner: string): (() => void) | null {
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
      return () => {
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
