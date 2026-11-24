import { preparePlaygroundTutorPrompt } from "@/features/javascript-playground/server/tutor";
import { PLAYGROUND_TUTOR_ID } from "@/features/javascript-playground/tutor-request";
import { createTutorHandler } from "@/features/problems/server/tutor-handler";

export const runtime = "nodejs";

const handler = createTutorHandler({
  preparePrompt: async (_id, value) => preparePlaygroundTutorPrompt(value),
});

export function POST(request: Request) {
  return handler(request, {
    params: Promise.resolve({ problemId: PLAYGROUND_TUTOR_ID }),
  });
}
