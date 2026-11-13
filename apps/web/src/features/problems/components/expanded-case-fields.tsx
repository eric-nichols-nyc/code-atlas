"use client";

import {
  compositionFunctions,
  mapTransforms,
  memoizeFunctions,
  reduceFunctions,
} from "@workspace/problems";
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

/** The added exercises share JSON inputs, optional numeric input and supplied callbacks. */
export function ExpandedCaseFields({ index }: { index: number }) {
  const session = useProblemSession();
  const draft = session.inputs[index];
  if (!draft) return null;
  const kind = session.problem.kind;
  const callbacks: readonly { id: string; label: string; code: string }[] =
    kind === "map-array"
      ? mapTransforms
      : kind === "reduce-array"
        ? reduceFunctions
        : kind === "memoize"
          ? memoizeFunctions
          : [];
  const selected = callbacks.find((item) => item.id === draft.callback);
  const jsonName =
    kind === "reduce-array"
      ? "nums"
      : kind === "memoize"
        ? "calls"
        : kind === "function-composition"
          ? "functions"
          : "arr";
  const numericName =
    kind === "reduce-array"
      ? "init"
      : kind === "chunk-array"
        ? "size"
        : kind === "function-composition"
          ? "x"
          : undefined;
  const prefix = `case-${index}`;
  const help =
    kind === "map-array" || kind === "reduce-array"
      ? "JSON integer array: up to 1000 values from -10000 to 10000. Empty arrays are allowed."
      : kind === "chunk-array"
        ? "JSON integer array: up to 1000 values from -1e9 to 1e9. Choose a chunk size from 1 to 1000."
        : kind === "function-composition"
          ? 'JSON list of up to 10 function IDs: "addOne", "double", "negate". Functions run right to left; [] is the identity.'
          : "JSON argument groups: up to 100 calls of 0–4 integers from -100 to 100. Subtract takes exactly two arguments. Output shows values and underlying callCount.";
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Label htmlFor={`${prefix}-json`} className="mb-2 font-mono text-xs">
          {jsonName} =
        </Label>
        <Input
          id={`${prefix}-json`}
          className="font-mono"
          value={draft.json}
          maxLength={32768}
          onChange={(event) =>
            session.updateInput(index, { json: event.target.value })
          }
          aria-describedby={`${prefix}-help`}
        />
        <p
          id={`${prefix}-help`}
          className="mt-2 text-xs leading-relaxed text-muted-foreground"
        >
          {help}
        </p>
      </div>
      {callbacks.length > 0 && (
        <div>
          <Label
            htmlFor={`${prefix}-callback`}
            className="mb-2 font-mono text-xs"
          >
            fn =
          </Label>
          <Select
            value={draft.callback}
            onValueChange={(callback) =>
              session.updateInput(index, { callback })
            }
          >
            <SelectTrigger
              id={`${prefix}-callback`}
              aria-label="fn ="
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {callbacks.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <pre className="mt-3 overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs leading-5">
            <code>{selected?.code}</code>
          </pre>
        </div>
      )}
      {kind === "function-composition" && (
        <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs leading-5">
          <code>
            {compositionFunctions.map((item) => item.code).join("\n")}
          </code>
        </pre>
      )}
      {numericName && (
        <div>
          <Label
            htmlFor={`${prefix}-number`}
            className="mb-2 font-mono text-xs"
          >
            {numericName} =
          </Label>
          <Input
            id={`${prefix}-number`}
            type="number"
            min={
              kind === "chunk-array"
                ? 1
                : kind === "function-composition"
                  ? -10000
                  : -1e9
            }
            max={
              kind === "chunk-array"
                ? 1000
                : kind === "function-composition"
                  ? 10000
                  : 1e9
            }
            step={1}
            className="font-mono"
            value={draft.value}
            onChange={(event) =>
              session.updateInput(index, { value: event.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}
