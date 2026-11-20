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

export function TwoDistinctCaseField({ index }: { index: number }) {
  const session = { ...useProblemCases(), problem: useProblemDefinition() };
  const draft = session.inputs[index];
  const id = useId();
  if (!draft) return null;
  const value = draft.s ?? "";
  const invalid =
    value.length < 1 || value.length > 100000 || /[^a-zA-Z]/.test(value);
  return (
    <FieldGroup>
      <Field data-invalid={invalid}>
        <FieldLabel htmlFor={id}>s =</FieldLabel>
        <Input
          id={id}
          value={value}
          aria-invalid={invalid}
          aria-describedby={`${id}-help`}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) =>
            session.updateInput(index, { s: event.target.value })
          }
        />
        <FieldDescription id={`${id}-help`}>
          1–100000 English letters (a–z or A–Z). Case matters. Enter a plain
          string without quotes.
        </FieldDescription>
      </Field>
    </FieldGroup>
  );
}
