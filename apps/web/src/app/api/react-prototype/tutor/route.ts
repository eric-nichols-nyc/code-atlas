import { createTutorHandler } from "@/features/problems/server/tutor-handler";
import { reactPrototypeExercise } from "@/features/react-sandbox/prototype/exercise";
import { prepareReactPrototypePrompt } from "@/features/react-sandbox/server/prototype-tutor";

export const runtime = "nodejs";
const handler = createTutorHandler({
  preparePrompt: prepareReactPrototypePrompt,
});
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development")
    return new Response(null, { status: 404 });
  return handler(request, {
    params: Promise.resolve({ problemId: reactPrototypeExercise.id }),
  });
}
