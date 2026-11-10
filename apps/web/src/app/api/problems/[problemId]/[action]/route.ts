import { auth } from "@clerk/nextjs/server";
import {
  findProblem,
  isExecutionResult,
  MAX_SOURCE_BYTES,
  validRunInputs,
} from "@workspace/problems";
import { isAuthConfigured } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string; action: string }> },
) {
  if (!isAuthConfigured())
    return Response.json(
      { error: "Authentication is not configured." },
      { status: 503 },
    );
  const session = await auth();
  if (!session.userId)
    return Response.json(
      { error: "Sign in to run or submit your code." },
      { status: 401 },
    );
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json(
      { error: "This request origin is not allowed." },
      { status: 403 },
    );
  const { problemId, action } = await params;
  const problem = findProblem(problemId);
  if (!problem || !["run", "submit"].includes(action))
    return Response.json(
      { error: "Problem or action unavailable." },
      { status: 404 },
    );
  let body: { code?: unknown; inputs?: unknown };
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing body");
    let text = "";
    let bytes = 0;
    const decoder = new TextDecoder();
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 64 * 1024) {
        await reader.cancel();
        return Response.json(
          { error: "Source request is too large." },
          { status: 413 },
        );
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    body = JSON.parse(text);
    if (!body || typeof body !== "object") throw new Error("Bad body");
  } catch {
    return Response.json(
      { error: "Provide a valid code request." },
      { status: 400 },
    );
  }
  if (
    typeof body.code !== "string" ||
    !body.code.trim() ||
    new TextEncoder().encode(body.code).length > MAX_SOURCE_BYTES
  )
    return Response.json(
      { error: "Provide JavaScript source up to 32 KiB." },
      { status: 400 },
    );
  if (action === "run" && !validRunInputs(problem, body.inputs))
    return Response.json(
      { error: `Use 1–5 test cases. ${problem.inputError}` },
      { status: 400 },
    );
  const token = await session.getToken();
  if (!token)
    return Response.json(
      { error: "Your session expired. Sign in again." },
      { status: 401 },
    );
  try {
    const base = process.env.API_URL || "http://127.0.0.1:4000";
    const upstream = await fetch(
      `${base.replace(/\/$/, "")}/v1/problems/${encodeURIComponent(problemId)}/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: body.code,
          ...(action === "run" ? { inputs: body.inputs } : {}),
        }),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(20000)]),
        cache: "no-store",
      },
    );
    const result: unknown = await upstream.json();
    if (!upstream.ok) {
      const message =
        result &&
        typeof result === "object" &&
        "error" in result &&
        typeof result.error === "string"
          ? result.error
          : "The runner could not complete this request.";
      return Response.json(
        { error: message },
        {
          status: [400, 401, 403, 404, 429, 503].includes(upstream.status)
            ? upstream.status
            : 503,
        },
      );
    }
    if (!isExecutionResult(result)) throw new Error("Invalid execution result");
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      {
        error:
          "The runner is unavailable. Your code has been kept. Please retry.",
      },
      { status: 503 },
    );
  }
}
