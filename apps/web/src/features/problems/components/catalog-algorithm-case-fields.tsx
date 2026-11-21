"use client";

import {
  type AlgorithmParameter,
  algorithmArgumentDraft,
  validAlgorithmArgument,
} from "@workspace/problems";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { type ChangeEvent, useId } from "react";
import {
  useProblemCases,
  useProblemDefinition,
} from "../state/problem-context";

function guidance(parameter: AlgorithmParameter) {
  if (parameter.type === "integer")
    return `Integer from ${parameter.min} to ${parameter.max}.`;
  if (parameter.type === "integers")
    return parameter.sorted
      ? "Enter a JSON array of integers sorted in ascending order."
      : "Enter a JSON array of integers.";
  if (parameter.type === "matrix")
    return parameter.square
      ? "Enter a square matrix as JSON, for example [[1,2],[3,4]]."
      : "Enter a rectangular matrix as JSON, for example [[1,2,3],[4,5,6]].";
  if (parameter.type === "strings")
    return 'Enter a JSON array of strings, for example ["ab","ba"].';
  if (parameter.minLength === 0) return "Leave blank for an empty string.";
  if (parameter.alphabet === "lowercase") return "Enter lowercase letters a–z.";
  return undefined;
}

export function CatalogAlgorithmCaseFields({ index }: { index: number }) {
  const problem = useProblemDefinition();
  const { inputs, updateInput } = useProblemCases();
  const id = useId();
  const args = inputs[index]?.args;
  const { parameters } = problem;
  if (!args || !parameters) return null;
  const values = parameters.map((parameter, index) =>
    algorithmArgumentDraft(parameter, args[index] ?? ""),
  );

  return (
    <FieldGroup>
      {parameters.map((spec, position) => {
        let parameter = spec;
        if (spec.type === "integer" && spec.maxLengthOfArgument !== undefined) {
          const relatedIndex = spec.maxLengthOfArgument;
          const related = values[relatedIndex];
          const relatedSpec = parameters[relatedIndex];
          if (
            relatedSpec &&
            Array.isArray(related) &&
            validAlgorithmArgument(relatedSpec, related)
          )
            parameter = { ...spec, max: Math.min(spec.max, related.length) };
        }
        const fieldId = `${id}-${parameter.name}`;
        const help = guidance(parameter);
        const value = args[position] ?? "";
        const invalid = !validAlgorithmArgument(parameter, values[position]);
        const props = {
          id: fieldId,
          value,
          "aria-invalid": invalid,
          "aria-describedby": help ? `${fieldId}-help` : undefined,
          autoComplete: "off",
          autoCapitalize: "none",
          spellCheck: false,
          className: "font-mono",
          onChange: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) =>
            updateInput(index, {
              args: args.map((item, itemIndex) =>
                itemIndex === position ? event.target.value : item,
              ),
            }),
        };

        return (
          <Field key={parameter.name} data-invalid={invalid}>
            <FieldLabel htmlFor={fieldId}>{parameter.name} =</FieldLabel>
            {parameter.type === "integer" ? (
              <Input
                type="number"
                min={parameter.min}
                max={parameter.max}
                step={1}
                {...props}
              />
            ) : parameter.type === "string" && parameter.alphabet ? (
              <Input {...props} />
            ) : (
              <Textarea rows={2} {...props} />
            )}
            {help && (
              <FieldDescription id={`${fieldId}-help`}>{help}</FieldDescription>
            )}
          </Field>
        );
      })}
    </FieldGroup>
  );
}
