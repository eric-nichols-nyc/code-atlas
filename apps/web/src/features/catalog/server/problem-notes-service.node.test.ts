import type { getDb } from "@workspace/db";
import { expect, it, vi } from "vitest";
import {
  emptyNoteContent,
  type NoteContent,
} from "../../problems/lib/problem-notes-contract";
import { createProblemNotesService } from "./problem-notes-service";

it.each(["javascript.sleep", "algorithms.valid-anagram"])(
  "keeps notes isolated by verified identity and problem, including clearing and empty reads for %s",
  async (problemId) => {
    const owners = new Map<string, { id: string }>();
    const notes = new Map<string, { content: NoteContent; updatedAt: Date }>();
    const progressWrite = vi.fn();
    const db = {
      user: {
        findUnique: vi.fn(
          async ({ where }: { where: { neonUserId: string } }) =>
            owners.get(where.neonUserId) ?? null,
        ),
        upsert: vi.fn(async ({ where }: { where: { neonUserId: string } }) => {
          const owner = owners.get(where.neonUserId) ?? {
            id: `internal:${where.neonUserId}`,
          };
          owners.set(where.neonUserId, owner);
          return owner;
        }),
      },
      problemNote: {
        findUnique: vi.fn(
          async ({
            where,
          }: {
            where: { userId_problemId: { userId: string; problemId: string } };
          }) => notes.get(JSON.stringify(where.userId_problemId)) ?? null,
        ),
        upsert: vi.fn(
          async (query: {
            where: { userId_problemId: { userId: string; problemId: string } };
            create: { content: NoteContent };
            select: unknown;
          }) => {
            const row = {
              content: query.create.content,
              updatedAt: new Date(),
            };
            notes.set(JSON.stringify(query.where.userId_problemId), row);
            return row;
          },
        ),
      },
      practiceProgress: { upsert: progressWrite, updateMany: progressWrite },
    };
    const supplier = vi.fn(() => db as unknown as ReturnType<typeof getDb>);
    const service = createProblemNotesService(supplier);
    expect(supplier).not.toHaveBeenCalled();
    await expect(service.read("", problemId)).rejects.toThrow(
      "Verified identity",
    );
    await expect(
      service.save("", problemId, emptyNoteContent()),
    ).rejects.toThrow("Verified identity");
    expect(supplier).not.toHaveBeenCalled();
    expect(await service.read("A", problemId)).toEqual({
      content: emptyNoteContent(),
      updatedAt: null,
    });
    expect(owners.size).toBe(0);
    const content: NoteContent = {
      formatVersion: 1,
      document: { ops: [{ insert: "private\n" }] },
    };
    const saved = await service.save("A", problemId, content);
    expect(saved).toMatchObject({ content, updatedAt: expect.any(String) });
    expect(await service.read("A", problemId)).toEqual(saved);
    expect((await service.read("B", problemId)).updatedAt).toBeNull();
    expect(
      (await service.read("A", "javascript.counter")).updatedAt,
    ).toBeNull();
    await service.save("B", problemId, content);
    await service.save("A", problemId, emptyNoteContent());
    expect((await service.read("A", problemId)).content).toEqual(
      emptyNoteContent(),
    );
    expect((await service.read("B", problemId)).content).toEqual(content);
    expect(notes.size).toBe(2);
    expect(db.problemNote.upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        update: { content: emptyNoteContent() },
        select: { content: true, updatedAt: true },
      }),
    );
    expect(progressWrite).not.toHaveBeenCalled();
  },
);
