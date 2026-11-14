import type { CodeWalkthroughDefinition } from "@/features/learning/lib/code-walkthrough";

export const useEffectLifecycleWalkthrough = {
  id: "react-use-effect-lifecycle",
  title: "Keep a timer synchronized with delay",
  source: `import { useEffect } from "react";

export function Heartbeat({ delay }) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("tick", delay);
    }, delay);

    return () => {
      clearInterval(intervalId);
    };
  }, [delay]);

  return null;
}`,
  steps: [
    {
      id: "setup",
      lines: [4, 5, 6, 7],
      explanation:
        "After the component's first commit, setup starts a timer using the current delay. For a delay of 1000 milliseconds, the callback logs once per second. This example explains the timer without starting it.",
    },
    {
      id: "dependencies",
      lines: [3, 6, 7, 12],
      explanation:
        "The Effect reads the delay prop, so delay belongs in its dependency list. React compares the next committed delay with the previous one using Object.is.",
    },
    {
      id: "unchanged",
      lines: [12],
      explanation:
        "If another render commits with the same delay, this dependency list does not request a new setup. The existing timer continues; an unrelated update does not replace it.",
    },
    {
      id: "cleanup-old",
      lines: [9, 10, 11],
      explanation:
        "Suppose delay changes from 1000 to 500. After that change commits, React first calls the previous cleanup. Its intervalId belongs to the old setup, so it clears the 1000-millisecond timer.",
    },
    {
      id: "setup-new",
      lines: [5, 6, 7, 12],
      explanation:
        "After old cleanup finishes, the new setup starts a timer with delay 500. The old and new synchronization periods are separate: stop the old timer, then start its replacement.",
    },
    {
      id: "unmount",
      lines: [9, 10, 11],
      explanation:
        "When Heartbeat leaves the page, React calls the latest cleanup to clear the remaining timer. Cleanup reverses setup; it also ran before replacement, not only when the component unmounted.",
    },
  ],
} as const satisfies CodeWalkthroughDefinition;
