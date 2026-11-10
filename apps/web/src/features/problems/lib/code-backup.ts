import { MAX_SOURCE_BYTES } from "@workspace/problems";

const key = (user: string, problem: string) =>
  `code-atlas:code:${encodeURIComponent(user)}:${encodeURIComponent(problem)}:pending`;
export function readCodeBackup(user: string, problem: string): string | null {
  try {
    const code = localStorage.getItem(key(user, problem));
    return code && new TextEncoder().encode(code).length <= MAX_SOURCE_BYTES
      ? code
      : null;
  } catch {
    return null;
  }
}
export function keepCodeBackup(user: string, problem: string, code: string) {
  try {
    if (new TextEncoder().encode(code).length <= MAX_SOURCE_BYTES)
      localStorage.setItem(key(user, problem), code);
  } catch {
    /* Current editor source remains available. */
  }
}
export function clearCodeBackup(user: string, problem: string, code: string) {
  try {
    if (readCodeBackup(user, problem) === code)
      localStorage.removeItem(key(user, problem));
  } catch {
    /* Duplicate backup is harmless. */
  }
}
