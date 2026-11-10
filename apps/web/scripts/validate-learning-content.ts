import { publicProblems, validMillis } from "@workspace/problems";
import { javascriptPracticeCatalog } from "../src/content/javascript/practice/catalog";

const errors: string[] = [];
for (const key of ["id", "slug", "order"] as const)
  if (
    new Set(javascriptPracticeCatalog.map((x) => x[key])).size !==
    javascriptPracticeCatalog.length
  )
    errors.push(`Duplicate catalog ${key}`);
const published = javascriptPracticeCatalog.filter(
  (x) => x.status === "published",
);
if (published.length !== 1 || published[0]?.id !== "javascript.sleep")
  errors.push("Publish only Sleep for this review.");
for (const entry of published)
  if (!publicProblems.some((x) => x.id === entry.id && x.slug === entry.slug))
    errors.push(`Missing problem ${entry.id}`);
for (const p of publicProblems)
  if (
    !p.starterCode.trim() ||
    !p.solution.trim() ||
    !p.samples.length ||
    !p.samples.every((x) => validMillis(x.millis)) ||
    !p.constraints.length
  )
    errors.push(`Invalid problem ${p.id}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "Practice content valid: Sleep is the only problem. Planned learning topics are separate; Learn is not published.",
  );
