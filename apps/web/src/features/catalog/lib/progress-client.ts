import type {
  PracticeProgressRecord,
  SavedProblemProgress,
} from "@workspace/problems";

export function isProgressRecord(
  value: unknown,
): value is PracticeProgressRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as PracticeProgressRecord;
  return (
    typeof r.problemId === "string" &&
    typeof r.flagged === "boolean" &&
    typeof r.legacyCompleted === "boolean" &&
    (r.solvedAt === null ||
      (typeof r.solvedAt === "string" &&
        Number.isFinite(Date.parse(r.solvedAt))))
  );
}
export async function progressRequest(path = "", init?: RequestInit) {
  const response = await fetch(`/api/practice-progress${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const value: unknown = await response.json();
  if (!response.ok)
    throw new Error("Account progress is unavailable. Please retry.");
  return value;
}
export function progressRecords(value: unknown): PracticeProgressRecord[] {
  if (
    !value ||
    typeof value !== "object" ||
    !("records" in value) ||
    !Array.isArray(value.records) ||
    !value.records.every(isProgressRecord)
  )
    throw new Error("Account progress returned an invalid response.");
  return value.records;
}
export async function loadSavedProgress(
  problemId: string,
  signal: AbortSignal,
) {
  const data = await progressRequest(`/${encodeURIComponent(problemId)}`, {
    signal,
  });
  if (!data || typeof data !== "object" || !("record" in data))
    throw new Error("Invalid saved code response.");
  if (data.record === null) return null;
  if (
    !isProgressRecord(data.record) ||
    data.record.problemId !== problemId ||
    !("lastCode" in data.record) ||
    !("codeUpdatedAt" in data.record) ||
    !(
      data.record.lastCode === null || typeof data.record.lastCode === "string"
    ) ||
    !(
      data.record.codeUpdatedAt === null ||
      typeof data.record.codeUpdatedAt === "string"
    )
  )
    throw new Error("Invalid saved code response.");
  return data.record as SavedProblemProgress;
}
