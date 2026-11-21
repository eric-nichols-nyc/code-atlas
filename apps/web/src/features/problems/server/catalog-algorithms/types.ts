import type {
  AlgorithmArgument,
  AlgorithmOutput,
  CatalogAlgorithmInput,
} from "@workspace/problems";

export type CatalogAlgorithmMode =
  | "unordered-rows"
  | "unordered-groups"
  | "in-place-matrix"
  | "sorted-prefix";

export interface CatalogAlgorithmJudge {
  inputs: CatalogAlgorithmInput[];
  expected: (args: AlgorithmArgument[]) => AlgorithmOutput;
  mode?: CatalogAlgorithmMode;
  entryCpuBudgetMs?: number;
}

export interface CatalogAlgorithmTarget {
  expected: AlgorithmOutput;
  mode?: CatalogAlgorithmMode;
  entryCpuBudgetMs?: number;
}
