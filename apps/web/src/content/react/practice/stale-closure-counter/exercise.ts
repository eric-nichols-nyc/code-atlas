// Trusted public authoring for the development-only React preview exercise.
export const staleClosureCounter = {
  id: "react.stale-closure-counter",
  slug: "stale-closure-counter",
  difficulty: "Medium",
  topic: "Hooks",
  title: "Stale Closure Counter",
  statement:
    "Fix a React TypeScript counter that gets stuck at 1. It should increase by 1 every second, using one interval that is cleaned up on unmount. Explain why the interval sees stale state.",
  requirements: [
    "Increase the counter by 1 each second.",
    "Keep one interval; clean it up on unmount.",
    "Explain what the effect's callback captures.",
  ],
  starter: `import { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.info("Interval captured count:", count);
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="counter">
      <h1>Counter</h1>
      <output aria-label="Counter value">{count}</output>
      <p>One interval. One update each second.</p>
    </main>
  );
}
`,
  css: `body { margin: 0; font-family: system-ui, sans-serif; background: #f8f7fc; color: #201831; }
.counter { display: grid; justify-items: center; gap: 16px; padding: 28px 16px; }
h1, p { margin: 0; } h1 { font-size: 24px; } p { color: #6a607b; font-size: 13px; }
output { display: grid; place-items: center; min-width: 84px; min-height: 76px; border-radius: 12px; background: #ece5ff; color: #6d38cb; font-size: 44px; font-weight: 700; }
`,
};
