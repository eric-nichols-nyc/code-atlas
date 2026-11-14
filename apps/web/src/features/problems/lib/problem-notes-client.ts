import {
  type NoteContent,
  parseNoteContent,
  parsePersonalNote,
} from "./problem-notes-contract";

export class ProblemNotesRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ProblemNotesRequestError";
  }
}

const statusMessage = (status: number) => {
  switch (status) {
    case 401:
      return "Your session has ended. Sign in again to save notes.";
    case 403:
      return "This request could not be authorized. Reload and retry.";
    case 404:
      return "This problem is no longer available.";
    case 400:
      return "The notes document could not be saved. Check its formatting and links.";
    case 413:
      return "Notes must fit within 64 KiB. Shorten the note and retry.";
    default:
      return "Account notes are temporarily unavailable. Please retry.";
  }
};

async function requestNote(
  problemId: string,
  signal: AbortSignal,
  content?: NoteContent,
) {
  let response: Response;
  try {
    response = await fetch(
      `/api/problems/${encodeURIComponent(problemId)}/notes`,
      {
        cache: "no-store",
        credentials: "same-origin",
        signal,
        ...(content
          ? {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content: parseNoteContent(content) }),
            }
          : {}),
      },
    );
  } catch (error) {
    if (signal.aborted) throw error;
    // Local document validation retains its safe message and size status.
    if (error instanceof Error && error.name === "NoteContentError")
      throw error;
    throw new ProblemNotesRequestError(
      0,
      "Could not reach the server. Your current notes have been kept.",
    );
  }
  if (!response.ok)
    throw new ProblemNotesRequestError(
      response.status,
      statusMessage(response.status),
    );
  try {
    const note = parsePersonalNote(await response.json());
    if (content && note.updatedAt === null)
      throw new Error("Save was not acknowledged");
    return note;
  } catch (error) {
    if (signal.aborted) throw error;
    throw new ProblemNotesRequestError(
      response.status,
      "The server returned an invalid notes response. Please retry.",
    );
  }
}

export const loadProblemNote = (problemId: string, signal: AbortSignal) =>
  requestNote(problemId, signal);
export const saveProblemNote = (
  problemId: string,
  content: NoteContent,
  signal: AbortSignal,
) => requestNote(problemId, signal, content);
