"use client";

import { curryFunctions } from "@workspace/problems";
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

export function CurryCaseFields({ index }: { index: number }) {
  const s = useProblemSession();
  const draft = s.inputs[index];
  if (!draft) return null;
  const callback = curryFunctions.find((item) => item.id === draft.callback);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Label htmlFor="callback-input" className="mb-2 font-mono text-xs">
          fn =
        </Label>
        <Select
          value={draft.callback}
          onValueChange={(value) => s.updateInput(index, { callback: value })}
        >
          <SelectTrigger
            id="callback-input"
            className="w-full"
            aria-label="fn ="
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {curryFunctions.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <pre className="mt-3 overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs leading-5">
          <code>{callback?.code}</code>
        </pre>
      </div>
      <div>
        <Label htmlFor="groups-input" className="mb-2 font-mono text-xs">
          groups =
        </Label>
        <Input
          id="groups-input"
          value={draft.json}
          maxLength={32768}
          onChange={(event) =>
            s.updateInput(index, { json: event.target.value })
          }
          aria-describedby="groups-help"
          className="font-mono"
        />
        <p id="groups-help" className="mt-2 text-xs text-muted-foreground">
          JSON argument groups, e.g. [[1], [2, 3]] means (1)(2, 3). Only the
          final group reaches fn.length ({callback?.arity ?? "?"}).
        </p>
      </div>
    </div>
  );
}
