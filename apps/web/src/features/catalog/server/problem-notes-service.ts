import "server-only";
import { getDb } from "@workspace/db";
import {
  emptyNoteContent,
  type NoteContent,
  parsePersonalNote,
} from "../../problems/lib/problem-notes-contract";

const noteSelection = { content: true, updatedAt: true } as const;

export function createProblemNotesService(database = getDb) {
  const dbFor = (neonUserId: string) => {
    if (!neonUserId) throw new Error("Verified identity required");
    return database();
  };
  const view = (note: { content: unknown; updatedAt: Date } | null) =>
    parsePersonalNote({
      content: note ? note.content : emptyNoteContent(),
      updatedAt: note?.updatedAt.toISOString() ?? null,
    });
  return {
    async read(neonUserId: string, problemId: string) {
      const db = dbFor(neonUserId);
      const owner = await db.user.findUnique({
        where: { neonUserId },
        select: { id: true },
      });
      if (!owner) return view(null);
      return view(
        await db.problemNote.findUnique({
          where: { userId_problemId: { userId: owner.id, problemId } },
          select: noteSelection,
        }),
      );
    },
    async save(neonUserId: string, problemId: string, content: NoteContent) {
      const db = dbFor(neonUserId);
      const owner = await db.user.upsert({
        where: { neonUserId },
        create: { neonUserId },
        update: { neonUserId },
        select: { id: true },
      });
      return view(
        await db.problemNote.upsert({
          where: { userId_problemId: { userId: owner.id, problemId } },
          create: { userId: owner.id, problemId, content },
          update: { content },
          select: noteSelection,
        }),
      );
    },
  };
}

export type ProblemNotesService = ReturnType<typeof createProblemNotesService>;
