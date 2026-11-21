import "server-only";
import { collectionCases } from "./collections";
import { matrixCases } from "./matrices";
import { numericCases } from "./numeric";
import { stringCases } from "./strings";
import type { CatalogAlgorithmJudge } from "./types";

export const catalogAlgorithmJudges: Record<string, CatalogAlgorithmJudge> = {
  ...collectionCases,
  ...matrixCases,
  ...numericCases,
  ...stringCases,
};
