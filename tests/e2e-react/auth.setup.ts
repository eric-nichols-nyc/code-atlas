import { mkdir } from "node:fs/promises";
import { expect, test as setup } from "@playwright/test";

setup(
  "authenticate the dedicated pilot learner through the server boundary",
  async ({ request }) => {
    const email = process.env.NEON_TEST_USER_EMAIL;
    const password = process.env.NEON_TEST_USER_PASSWORD;
    if (!email || !password)
      throw new Error("Dedicated test learner is missing");
    const response = await request.post("/api/auth/sign-in/email", {
      headers: { origin: "http://localhost:3000" },
      data: { email, password },
    });
    expect(response.ok(), "Dedicated learner sign-in failed").toBe(true);
    expect((await request.get("/api/me")).status()).toBe(200);
    await mkdir(".auth", { recursive: true });
    await request.storageState({ path: ".auth/learner-react.json" });
  },
);
