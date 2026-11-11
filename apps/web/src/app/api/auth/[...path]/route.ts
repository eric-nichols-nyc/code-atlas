import { isAuthConfigured } from "@/lib/auth";
import { getAuth } from "@/lib/auth/server";

export const runtime = "nodejs";
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Handler = ReturnType<ReturnType<typeof getAuth>["handler"]>["GET"];

function handle(method: Method): Handler {
  return async (request, context) => {
    if (!isAuthConfigured())
      return Response.json(
        { error: "Authentication is not configured." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    try {
      return await getAuth().handler()[method](request, context);
    } catch {
      return Response.json(
        { error: "Authentication is temporarily unavailable. Try again." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  };
}

export const GET = handle("GET");
export const POST = handle("POST");
export const PUT = handle("PUT");
export const PATCH = handle("PATCH");
export const DELETE = handle("DELETE");
