import { createEvaluationHandler } from "@/features/problems/server/evaluation-handler";

export const runtime = "nodejs";
export const POST = createEvaluationHandler();
