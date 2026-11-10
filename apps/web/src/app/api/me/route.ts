import { json, requireLearner } from "@/server/http";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const userId = await requireLearner(request);
  return userId instanceof Response ? userId : json({ userId });
}
