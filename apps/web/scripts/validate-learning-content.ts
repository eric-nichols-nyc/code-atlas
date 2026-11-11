import { publicProblems, validProblemInput } from "@workspace/problems";
import { javascriptPracticeCatalog } from "../src/content/javascript/practice/catalog";
import { problemStatements } from "../src/content/javascript/practice/statements";

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
if (published.length !== publicProblems.length)
  errors.push("Published catalog and public definitions must agree.");
for (const entry of published)
  if (
    !publicProblems.some((x) => x.id === entry.id && x.slug === entry.slug) ||
    !problemStatements[entry.slug]
  )
    errors.push(`Missing problem ${entry.id}`);
for (const p of publicProblems)
  if (
    !p.starterCode.trim() ||
    !p.solution.trim() ||
    !p.samples.length ||
    !p.samples.every(
      (x) =>
        validProblemInput(p, x.input) &&
        (p.kind === "delay" ||
          (p.kind === "curry"
            ? typeof x.expected === "number" && Number.isFinite(x.expected)
            : Array.isArray(x.expected))),
    ) ||
    !p.constraints.length
  )
    errors.push(`Invalid problem ${p.id}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Practice content valid: ${published.map((entry) => entry.title).join(", ")}. Learn is not published.`,
  );
