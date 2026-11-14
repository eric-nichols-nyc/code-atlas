import { readFile } from "node:fs/promises";
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
for (const entry of published) {
  try {
    const statement = await readFile(
      new URL(
        `../src/content/javascript/practice/${entry.slug}/problem.mdx`,
        import.meta.url,
      ),
      "utf8",
    );
    if (!statement.trim() || Buffer.byteLength(statement, "utf8") > 16 * 1024)
      errors.push(`Invalid tutor statement ${entry.id}`);
  } catch {
    errors.push(`Missing tutor statement ${entry.id}`);
  }
}
for (const p of publicProblems)
  if (
    !p.starterCode.trim() ||
    !p.solution.trim() ||
    !p.samples.length ||
    !p.samples.every(
      (x) =>
        validProblemInput(p, x.input) &&
        (p.kind === "delay" ||
          (["curry", "reduce-array", "function-composition"].includes(p.kind)
            ? typeof x.expected === "number" && Number.isFinite(x.expected)
            : p.kind === "memoize"
              ? Boolean(
                  x.expected &&
                    !Array.isArray(x.expected) &&
                    typeof x.expected === "object" &&
                    "values" in x.expected &&
                    Array.isArray(x.expected.values) &&
                    "callCount" in x.expected &&
                    Number.isInteger(x.expected.callCount),
                )
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
