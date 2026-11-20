"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Textarea } from "@workspace/ui/components/textarea";
import { useId } from "react";
import {
  useProblemCases,
  useProblemDefinition,
} from "../state/problem-context";

export function MostFrequentCharacterCaseField({ index }: { index: number }) {
  const session = { ...useProblemCases(), problem: useProblemDefinition() };
  const draft = session.inputs[index];
  const id = useId();
  if (!draft) return null;
  const value = draft.str ?? "";
  const invalid = value.length > 1000;
  return (
    <FieldGroup>
      <Field data-invalid={invalid}>
        <FieldLabel htmlFor={id}>str =</FieldLabel>
        <Textarea
          id={id}
          value={value}
          rows={2}
          aria-invalid={invalid}
          aria-describedby={`${id}-help`}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) =>
            session.updateInput(index, { str: event.target.value })
          }
        />
        <FieldDescription id={`${id}-help`}>
          Case-sensitive text, up to 1000 UTF-16 code units. Spaces and line
          breaks count. Leave blank for an empty string.
        </FieldDescription>
      </Field>
    </FieldGroup>
  );
}
