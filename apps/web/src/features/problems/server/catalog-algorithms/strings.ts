import type { AlgorithmArgument } from "@workspace/problems";
import type { CatalogAlgorithmJudge } from "./types";

function longestWindow([input]: AlgorithmArgument[]) {
  const str = input as string;
  const positions = new Int32Array(65_536);
  let best = 0;
  let start = 0;
  for (let i = 0; i < str.length; i++) {
    const unit = str.charCodeAt(i);
    start = Math.max(start, positions[unit] ?? 0);
    positions[unit] = i + 1;
    best = Math.max(best, i - start + 1);
  }
  return best;
}

export const stringCases = {
  "algorithms.valid-palindrome": {
    inputs: [
      { args: [""] },
      { args: [".."] },
      { args: ["A7 ; 7a"] },
      { args: ["a0a1a"] },
      { args: ["ab".repeat(50_000) + "ba".repeat(50_000)] },
      { args: ["!".repeat(200_000)] },
    ],
    expected: ([input]) => {
      const normalized = (input as string)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      return normalized === normalized.split("").reverse().join("");
    },
  },
  "algorithms.longest-unique-substring": {
    inputs: [
      { args: ["x"] },
      { args: ["abba"] },
      { args: ["aA 5a"] },
      { args: ["\u0000a\u0000b"] },
      { args: ["😊a😊"] },
      { args: ["abcdefgEe".repeat(5_000)] },
    ],
    expected: longestWindow,
  },
  "algorithms.merge-strings-alternately": {
    inputs: [
      { args: ["x", "y"] },
      { args: ["a", "wxyz"] },
      { args: ["vwxyz", "ab"] },
      { args: ["ab".repeat(50), "cd".repeat(50)] },
    ],
    expected: ([first, second]) => {
      const word1 = first as string;
      const word2 = second as string;
      const letters = [];
      for (let i = 0; i < Math.max(word1.length, word2.length); i++)
        letters.push(word1[i] ?? "", word2[i] ?? "");
      return letters.join("");
    },
  },
  "algorithms.reverse-vowels-of-a-string": {
    inputs: [
      { args: ["I"] },
      { args: ["e a! O."] },
      { args: ["aeIOu"] },
      { args: ["Y? 123"] },
      { args: [`${"aO-bE-g".repeat(42_857)}u`] },
      { args: ["aEiOU".repeat(60_000)] },
    ],
    expected: ([input]) => {
      const source = input as string;
      const vowels = source.match(/[aeiou]/gi) ?? [];
      return source.replace(/[aeiou]/gi, (vowel) => vowels.pop() ?? vowel);
    },
  },
  "algorithms.longest-substring-without-repeating-characters": {
    inputs: [
      { args: [""] },
      { args: ["eeee"] },
      { args: ["anviaj"] },
      { args: ["s\u0000i\u0000x"] },
      { args: ["🧮😀"] },
      { args: ["xyz ".repeat(12_500)] },
    ],
    expected: longestWindow,
  },
} satisfies Record<string, CatalogAlgorithmJudge>;
