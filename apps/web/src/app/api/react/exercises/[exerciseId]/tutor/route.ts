import { createTutorHandler } from "@/features/problems/server/tutor-handler";
import { isReactPilotAvailable } from "@/features/react-sandbox/lib/availability";
import { prepareReactTutorPrompt } from "@/features/react-sandbox/server/react-tutor";

export const runtime = "nodejs";
const handler = createTutorHandler({ preparePrompt: prepareReactTutorPrompt });
export async function POST(
  request: Request,
  context: { params: Promise<{ exerciseId: string }> },
) {
  if (!isReactPilotAvailable()) return new Response(null, { status: 404 });
  return handler(request, {
    params: context.params.then(({ exerciseId }) => ({
      problemId: exerciseId,
    })),
  });
}
