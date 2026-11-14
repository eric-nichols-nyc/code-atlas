import type { getDb } from "@workspace/db";
import { expect, it, vi } from "vitest";
import {
  emptyNoteContent,
  type NoteContent,
} from "../../problems/lib/problem-notes-contract";
import { createProblemNotesService } from "./problem-notes-service";

it("keeps notes isolated by verified identity and problem, including clearing and empty reads", async () => {
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
          const row = { content: query.create.content, updatedAt: new Date() };
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
  await expect(service.read("", "javascript.sleep")).rejects.toThrow(
    "Verified identity",
  );
  await expect(
    service.save("", "javascript.sleep", emptyNoteContent()),
  ).rejects.toThrow("Verified identity");
  expect(supplier).not.toHaveBeenCalled();
  expect(await service.read("A", "javascript.sleep")).toEqual({
    content: emptyNoteContent(),
    updatedAt: null,
  });
  expect(owners.size).toBe(0);
  const content: NoteContent = {
    formatVersion: 1,
    document: { ops: [{ insert: "private\n" }] },
  };
  const saved = await service.save("A", "javascript.sleep", content);
  expect(saved).toMatchObject({ content, updatedAt: expect.any(String) });
  expect(await service.read("A", "javascript.sleep")).toEqual(saved);
  expect((await service.read("B", "javascript.sleep")).updatedAt).toBeNull();
  expect((await service.read("A", "javascript.counter")).updatedAt).toBeNull();
  await service.save("B", "javascript.sleep", content);
  await service.save("A", "javascript.sleep", emptyNoteContent());
  expect((await service.read("A", "javascript.sleep")).content).toEqual(
    emptyNoteContent(),
  );
  expect((await service.read("B", "javascript.sleep")).content).toEqual(
    content,
  );
  expect(notes.size).toBe(2);
  expect(db.problemNote.upsert).toHaveBeenLastCalledWith(
    expect.objectContaining({
      update: { content: emptyNoteContent() },
      select: { content: true, updatedAt: true },
    }),
  );
  expect(progressWrite).not.toHaveBeenCalled();
});
