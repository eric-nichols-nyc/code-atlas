import { createProblemNotesHandlers } from "@/features/catalog/server/problem-notes-handlers";

export const runtime = "nodejs";
export const { GET, PUT } = createProblemNotesHandlers();
