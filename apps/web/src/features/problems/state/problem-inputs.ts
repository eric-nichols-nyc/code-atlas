"use client";

import type { ProblemDefinition } from "@workspace/problems";
import { useCallback, useMemo, useState } from "react";
import {
  type InputDraft,
  inputDraft,
  parseInputDraft,
} from "../lib/input-drafts";

export function useProblemInputs(problem: ProblemDefinition) {
  const [cases, setCases] = useState(() =>
    problem.samples.map((sample) => ({
      id: sample.id,
      draft: inputDraft(sample.input),
    })),
  );
  const [selectedCase, setSelectedCase] = useState("0");
  const inputs = useMemo(() => cases.map((item) => item.draft), [cases]);
  const inputIds = useMemo(() => cases.map((item) => item.id), [cases]);
  const parsedInputs = useMemo(
    () => inputs.map((draft) => parseInputDraft(problem, draft)),
    [problem, inputs],
  );
  const updateInput = useCallback(
    (index: number, patch: Partial<InputDraft>) => {
      setCases((previous) =>
        previous.map((item, i) =>
          i === index ? { ...item, draft: { ...item.draft, ...patch } } : item,
        ),
      );
    },
    [],
  );
  const addCase = useCallback(() => {
    const sample = problem.samples[0];
    if (!sample || cases.length >= 5) return;
    setCases([
      ...cases,
      { id: crypto.randomUUID(), draft: inputDraft(sample.input) },
    ]);
    setSelectedCase(String(cases.length));
  }, [cases, problem]);

  return useMemo(
    () => ({
      inputs,
      inputIds,
      parsedInputs,
      selectedCase,
      setSelectedCase,
      updateInput,
      addCase,
    }),
    [inputs, inputIds, parsedInputs, selectedCase, updateInput, addCase],
  );
}
