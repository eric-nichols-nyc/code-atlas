import { expect, it } from "vitest";
import { createTutorLimiter } from "./tutor-limits";

it("bounds active work globally/per learner, releases once and prunes expired idle records", () => {
  let time = 1000;
  const limits = createTutorLimiter(() => time);
  const releases = Array.from({ length: 4 }, (_, i) =>
    limits.acquire(`learner-${i}`),
  );
  expect(limits.acquire("learner-0")).toBeNull();
  expect(limits.acquire("fifth")).toBeNull();
  for (const release of releases) {
    release?.();
    release?.();
  }
  expect(limits.acquire("fifth")).not.toBeNull();
  time += 60000;
  const release = limits.acquire("fresh");
  expect(release).not.toBeNull();
  expect(limits.size).toBe(2);
});
it("caps frequency and resets the window without losing active leases", () => {
  let time = 100;
  const limits = createTutorLimiter(() => time);
  for (let i = 0; i < 10; i++) {
    const release = limits.acquire("learner");
    expect(release).not.toBeNull();
    release?.();
  }
  expect(limits.acquire("learner")).toBeNull();
  time += 60000;
  const release = limits.acquire("learner");
  expect(release).not.toBeNull();
  time += 60000;
  expect(limits.acquire("learner")).toBeNull();
  release?.();
  expect(limits.acquire("learner")).not.toBeNull();
});
