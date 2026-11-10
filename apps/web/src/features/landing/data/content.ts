import {
  BookOpenIcon,
  CircleCheckIcon,
  LayoutDashboardIcon,
} from "@workspace/ui/components/icons";

export const practiceSteps = [
  {
    number: "01",
    icon: BookOpenIcon,
    title: "Get the idea.",
    description:
      "Start with a clear problem, examples and constraints. Open a hint when you need a nudge, and the solution when you're ready to compare.",
  },
  {
    number: "02",
    icon: CircleCheckIcon,
    title: "Make it work.",
    description:
      "Write JavaScript in a focused workspace. Run your own cases, then submit against the complete test suite. Real results show you what to work on.",
  },
  {
    number: "03",
    icon: LayoutDashboardIcon,
    title: "Keep your place.",
    description:
      "Flag a problem for later. Your solved status and latest Run or Submit code stay with your account, ready for the next session.",
  },
] as const;

export const landingQuestions = [
  {
    id: "start",
    question: "Where should I start?",
    answer:
      "Try the Counter example above, then open the full problem and write your own solution. It is a small introduction to closures. Arrays and async problems are there when you want to try something different.",
  },
  {
    id: "save",
    question: "What happens to my code?",
    answer:
      "When you're signed in, Run and Submit save your latest code to your account, even when the solution is incorrect. It is restored when you reopen the problem. Edits you haven't run or submitted are not automatically saved.",
  },
  {
    id: "subjects",
    question: "Is there more than JavaScript?",
    answer:
      "JavaScript practice is available now. Guided learning, Algorithms and React JS are planned and clearly marked as coming soon. This is a growing map, and JavaScript is the first path.",
  },
] as const;
