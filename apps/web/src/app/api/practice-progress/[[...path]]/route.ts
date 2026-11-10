import { auth } from "@clerk/nextjs/server";
import { findProblem } from "@workspace/problems";
import { isAuthConfigured } from "@/lib/auth";

export const runtime = "nodejs";
type Context = { params: Promise<{ path?: string[] }> };
async function forward(request: Request, { params }: Context) {
  const headers = { "Cache-Control": "no-store" };
  const error = (message: string, status: number) =>
    Response.json({ error: message }, { status, headers });
  if (!isAuthConfigured())
    return error("Authentication is not configured.", 503);
  const session = await auth();
  if (!session.userId) return error("Sign in to access account progress.", 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return error("This request origin is not allowed.", 403);
  const path = (await params).path ?? [];
  const method = request.method;
  const id = path[0];
  if (
    path.length > 1 ||
    !(
      (method === "GET" && (!id || findProblem(id))) ||
      (method === "POST" && id === "import") ||
      (method === "PATCH" && id && findProblem(id))
    )
  )
    return error("Progress route unavailable.", 404);
  const token = await session.getToken();
  if (!token) return error("Your session expired. Sign in again.", 401);
  let body: string | undefined;
  if (method !== "GET") {
    const reader = request.body?.getReader();
    if (!reader) return error("Provide a valid progress request.", 400);
    const decoder = new TextDecoder();
    let bytes = 0;
    body = "";
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return error("Progress request is too large.", 413);
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
    try {
      JSON.parse(body);
    } catch {
      return error("Provide a valid progress request.", 400);
    }
  }
  try {
    const base = (process.env.API_URL || "http://127.0.0.1:4000").replace(
      /\/$/,
      "",
    );
    const upstream = await fetch(
      `${base}/v1/practice-progress${id ? `/${encodeURIComponent(id)}` : ""}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
        cache: "no-store",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(20000)]),
      },
    );
    const value: unknown = await upstream.json();
    if (!upstream.ok)
      return error(
        "Account progress is unavailable. Please retry.",
        [400, 401, 403, 404, 429, 503].includes(upstream.status)
          ? upstream.status
          : 503,
      );
    return Response.json(value, { headers });
  } catch {
    return error(
      "Account progress is unavailable. Your browser records are kept.",
      503,
    );
  }
}
export const GET = forward;
export const POST = forward;
export const PATCH = forward;
