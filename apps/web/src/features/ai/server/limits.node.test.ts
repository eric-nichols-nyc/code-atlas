import { expect, it } from "vitest";
import { createAiLimiter } from "./limits";

it("bounds active work globally/per learner, releases once and prunes expired idle records", async () => {
  let time = 1000;
  const limits = createAiLimiter(() => time);
  const releases = await Promise.all(
    Array.from({ length: 4 }, (_, i) => limits.acquire(`learner-${i}`)),
  );
  expect(await limits.acquire("learner-0")).toBeNull();
  expect(await limits.acquire("fifth")).toBeNull();
  for (const release of releases) {
    await release?.();
    await release?.();
  }
  expect(await limits.acquire("fifth")).not.toBeNull();
  time += 60000;
  const release = await limits.acquire("fresh");
  expect(release).not.toBeNull();
  expect(limits.size).toBe(2);
});
it("caps frequency and resets the window without losing active leases", async () => {
  let time = 100;
  const limits = createAiLimiter(() => time);
  for (let i = 0; i < 10; i++) {
    const release = await limits.acquire("learner");
    expect(release).not.toBeNull();
    await release?.();
  }
  expect(await limits.acquire("learner")).toBeNull();
  time += 60000;
  const release = await limits.acquire("learner");
  expect(release).not.toBeNull();
  time += 60000;
  expect(await limits.acquire("learner")).toBeNull();
  await release?.();
  expect(await limits.acquire("learner")).not.toBeNull();
});
