"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { useId } from "react";
import {
  useProblemCases,
  useProblemDefinition,
} from "../state/problem-context";

export function AnagramCaseFields({ index }: { index: number }) {
  const session = { ...useProblemCases(), problem: useProblemDefinition() };
  const draft = session.inputs[index];
  const id = useId();
  if (!draft) return null;
  return (
    <FieldGroup>
      {(["s", "t"] as const).map((name) => {
        const value = draft[name] ?? "";
        const invalid = value.length > 1000 || /[^a-z]/.test(value);
        return (
          <Field key={name} data-invalid={invalid}>
            <FieldLabel htmlFor={`${id}-${name}`}>{name} =</FieldLabel>
            <Input
              id={`${id}-${name}`}
              value={value}
              aria-invalid={invalid}
              aria-describedby={`${id}-${name}-help`}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) =>
                session.updateInput(index, { [name]: event.target.value })
              }
            />
            <FieldDescription id={`${id}-${name}-help`}>
              Lowercase letters a–z, up to 1000 characters. Leave blank for an
              empty string.
            </FieldDescription>
          </Field>
        );
      })}
    </FieldGroup>
  );
}
