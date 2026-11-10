import "server-only";
import { findProblem, publicProblems } from "@workspace/problems";
import { json, readJson, requireLearner } from "@/server/http";
import {
  createProgressService,
  type ProgressService,
} from "./progress-service";

type Context = { params: Promise<{ path?: string[] }> };
export function createProgressHandlers(
  progress: ProgressService = createProgressService(),
) {
  const handle = async (request: Request, context: Context) => {
    const userId = await requireLearner(request);
    if (userId instanceof Response) return userId;
    const parts = (await context.params).path ?? [];
    const id = parts[0];
    const method = request.method;
    if (
      parts.length > 1 ||
      !(
        (method === "GET" && (!id || findProblem(id))) ||
        (method === "POST" && id === "import") ||
        (method === "PATCH" && id && findProblem(id))
      )
    )
      return json({ error: "Progress route unavailable." }, 404);
    let value: unknown;
    if (method !== "GET") {
      try {
        value = await readJson(request, 8192);
      } catch (error) {
        if (error instanceof Response) return error;
        throw error;
      }
    }
    const body = value as Record<string, unknown> | null;
    if (
      method === "PATCH" &&
      (!body ||
        Object.keys(body).length !== 1 ||
        typeof body.flagged !== "boolean")
    )
      return json({ error: "Only flagged status may be changed here." }, 400);
    const validIds = (ids: unknown): ids is string[] =>
      Array.isArray(ids) &&
      ids.length <= publicProblems.length &&
      ids.every((id) => typeof id === "string" && findProblem(id)?.id === id);
    if (
      method === "POST" &&
      (!body ||
        Object.keys(body).some((key) => !["flagged", "solved"].includes(key)) ||
        !validIds(body.flagged) ||
        !validIds(body.solved))
    )
      return json(
        { error: "Provide valid legacy flags and completion records." },
        400,
      );
    try {
      if (method === "GET")
        return id
          ? json({
              record: await progress.read(
                userId,
                findProblem(id)?.id as string,
              ),
            })
          : json({ records: await progress.list(userId) });
      if (method === "PATCH")
        return json({
          record: await progress.flag(
            userId,
            findProblem(id as string)?.id as string,
            body?.flagged as boolean,
          ),
        });
      return json({
        records: await progress.importLegacy(
          userId,
          body?.flagged as string[],
          body?.solved as string[],
        ),
      });
    } catch {
      return json(
        {
          error:
            "Account progress is unavailable. Your browser records are kept. Please retry.",
        },
        503,
      );
    }
  };
  return { GET: handle, POST: handle, PATCH: handle };
}
