import "server-only";
import { isAuthConfigured } from "@/lib/auth";
import { getVerifiedUserId } from "@/lib/auth/server";

export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Every protected Route Handler calls this before touching data or execution. */
export async function requireLearner(request: Request) {
  if (!isAuthConfigured())
    return json({ error: "Authentication is not configured." }, 503);
  let userId: string | null;
  try {
    userId = await getVerifiedUserId();
  } catch {
    return json({ error: "Authentication is temporarily unavailable." }, 503);
  }
  if (!userId) return json({ error: "Sign in to access this resource." }, 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return json({ error: "This request origin is not allowed." }, 403);
  return userId;
}

export async function readJson(
  request: Request,
  limit: number,
): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw json({ error: "Provide a valid JSON request." }, 400);
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > limit) {
        await reader.cancel();
        throw json({ error: "Request is too large." }, 413);
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch (error) {
    if (error instanceof Response) throw error;
    throw json({ error: "Provide a valid JSON request." }, 400);
  } finally {
    reader.releaseLock();
  }
}
