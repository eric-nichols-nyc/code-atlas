import "server-only";
import { findProblem } from "@workspace/problems";
import { json, readJson, requireLearner } from "@/server/http";
import {
  isObject,
  MAX_NOTE_REQUEST_BYTES,
  type NoteContent,
  NoteContentError,
  parseNoteContent,
  parsePersonalNote,
} from "../../problems/lib/problem-notes-contract";
import {
  createProblemNotesService,
  type ProblemNotesService,
} from "./problem-notes-service";

type Context = { params: Promise<{ problemId: string }> };

export function createProblemNotesHandlers(
  notes: ProblemNotesService = createProblemNotesService(),
) {
  const handle = async (request: Request, context: Context) => {
    const learner = await requireLearner(request);
    if (learner instanceof Response) return learner;
    const problem = findProblem((await context.params).problemId);
    if (!problem) return json({ error: "Problem not found." }, 404);
    let content: NoteContent | undefined;
    if (request.method === "PUT") {
      try {
        const body = await readJson(request, MAX_NOTE_REQUEST_BYTES);
        if (
          !isObject(body) ||
          Object.keys(body).length !== 1 ||
          !("content" in body)
        )
          throw new NoteContentError("Provide only the notes content.");
        content = parseNoteContent(body.content);
      } catch (error) {
        if (error instanceof Response) return error;
        if (error instanceof NoteContentError)
          return json({ error: error.message }, error.status);
        return json({ error: "Provide a valid notes document." }, 400);
      }
    }
    try {
      const note = content
        ? await notes.save(learner, problem.id, content)
        : await notes.read(learner, problem.id);
      return json(parsePersonalNote(note));
    } catch {
      return json(
        { error: "Account notes are temporarily unavailable. Please retry." },
        503,
      );
    }
  };
  return { GET: handle, PUT: handle };
}
