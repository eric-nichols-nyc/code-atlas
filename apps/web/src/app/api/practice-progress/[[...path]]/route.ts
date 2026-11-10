import { createProgressHandlers } from "@/features/catalog/server/progress-handlers";

export const runtime = "nodejs";
const handlers = createProgressHandlers();
export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
