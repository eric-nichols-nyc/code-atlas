"use client";
import { filterPredicates } from "@workspace/problems";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useProblemSession } from "../state/problem-session";
import { CurryCaseFields } from "./curry-case-fields";
export function CaseInputFields({ index }: { index: number }) {
  const s = useProblemSession();
  const draft = s.inputs[index];
  if (!draft) return null;
  const kind = s.problem.kind;
  if (kind === "curry") return <CurryCaseFields index={index} />;
  const predicate = filterPredicates.find(
    (item) => item.id === draft.predicate,
  );
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {kind !== "filter-array" && kind !== "flatten-array" && (
        <div>
          <Label htmlFor="primary-input" className="mb-2 font-mono text-xs">
            {kind === "counter"
              ? "n ="
              : kind === "fibonacci-generator"
                ? "count ="
                : kind === "delay-all"
                  ? "ms ="
                  : kind === "debounce"
                    ? "t ="
                    : "millis ="}
          </Label>
          <Input
            id="primary-input"
            type="number"
            min={kind === "counter" ? -1000 : kind === "delay" ? 1 : 0}
            max={kind === "fibonacci-generator" ? 50 : 1000}
            step={1}
            value={draft.value}
            onChange={(e) => s.updateInput(index, { value: e.target.value })}
            className="font-mono"
            aria-describedby={
              kind === "fibonacci-generator" ? "generator-help" : undefined
            }
          />
          {kind === "fibonacci-generator" && (
            <p
              id="generator-help"
              className="mt-2 text-xs text-muted-foreground"
            >
              Number of .next() calls. The generator itself takes no arguments.
            </p>
          )}
        </div>
      )}
      {kind === "counter" && (
        <div>
          <Label htmlFor="calls-input" className="mb-2 font-mono text-xs">
            calls =
          </Label>
          <Input
            id="calls-input"
            type="number"
            min={0}
            max={1000}
            step={1}
            value={draft.calls}
            onChange={(e) => s.updateInput(index, { calls: e.target.value })}
            aria-describedby="calls-help"
            className="font-mono"
          />
          <p id="calls-help" className="mt-2 text-xs text-muted-foreground">
            Number of times to invoke the returned counter function.
          </p>
        </div>
      )}
      {(kind === "debounce" ||
        kind === "filter-array" ||
        kind === "flatten-array" ||
        kind === "delay-all") && (
        <div>
          <Label htmlFor="json-input" className="mb-2 font-mono text-xs">
            {kind === "debounce"
              ? "calls ="
              : kind === "delay-all"
                ? "functions ="
                : "arr ="}
          </Label>
          <Input
            id="json-input"
            value={draft.json}
            maxLength={32768}
            onChange={(e) => s.updateInput(index, { json: e.target.value })}
            aria-describedby="json-help"
            className="font-mono"
          />
          <p id="json-help" className="mt-2 text-xs text-muted-foreground">
            {kind === "debounce"
              ? 'JSON schedule, e.g. [{"t":50,"inputs":[1]}]. Times are milliseconds.'
              : kind === "delay-all"
                ? 'JSON function descriptors, e.g. [{"t":30,"value":1}]. Each original fulfills after t milliseconds.'
                : kind === "flatten-array"
                  ? "Nested JSON integer array. Empty arrays are allowed; at most 20 array levels and 1000 total array/number nodes."
                  : "JSON integer array. Empty arrays are allowed."}
          </p>
        </div>
      )}
      {kind === "filter-array" && (
        <div>
          <Label htmlFor="predicate-input" className="mb-2 font-mono text-xs">
            fn =
          </Label>
          <Select
            value={draft.predicate}
            onValueChange={(value) =>
              s.updateInput(index, { predicate: value })
            }
          >
            <SelectTrigger
              id="predicate-input"
              className="w-full"
              aria-label="fn ="
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {filterPredicates.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <pre className="mt-3 overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs leading-5">
            <code>{predicate?.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
