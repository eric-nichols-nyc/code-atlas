import type { CatalogAlgorithmDefinition } from "../../types.js";

export const groupAnagramsProblem = {
  id: "algorithms.group-anagrams",
  slug: "group-anagrams",
  subjectId: "algorithms",
  topicId: "hash-maps",
  kind: "catalog-algorithm",
  title: "Group Anagrams",
  summary: "Group words that use the same letters in the same quantities.",
  difficulty: "Medium",
  entryFunction: "groupAnagrams",
  parameters: [
    {
      name: "strs",
      type: "strings",
      minLength: 1,
      maxLength: 1000,
      minWordLength: 0,
      maxWordLength: 100,
      alphabet: "lowercase",
    },
  ],
  inputError:
    "Enter a JSON array of 1–1,000 strings containing 0–100 lowercase English letters each.",
  starterCode: `function groupAnagrams(strs) {
  // Return one array for each group of anagrams.
  return [];
}`,
  samples: [
    {
      id: "mixed-groups",
      input: { args: [["arc", "care", "car", "race", "dog"]] },
      expected: [["arc", "car"], ["care", "race"], ["dog"]],
      explanation:
        "arc and car share one set of letter counts. care and race share another. dog forms its own group.",
    },
    {
      id: "repeated-empty-words",
      input: { args: [["", "a", ""]] },
      expected: [["", ""], ["a"]],
      explanation:
        "Both occurrences of the empty string belong together and must appear in the result.",
    },
  ],
  constraints: [
    "strs contains 1–1,000 strings.",
    "Each string has 0–100 characters from a through z.",
    "Return every input occurrence. Groups and members can appear in any order.",
  ],
  hints: [
    "Anagrams have identical letter counts, so look for a key that ignores the order of letters.",
    "Sorting the letters gives a shared key for all anagrams. Use a Map from each key to a list of the original words.",
  ],
  solution: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const word of strs) {
    const key = word.split("").sort().join("");
    const group = groups.get(key);
    if (group) {
      group.push(word);
    } else {
      groups.set(key, [word]);
    }
  }
  return Array.from(groups.values());
}`,
  solutionExplanation:
    "Sorting each word's letters gives every anagram the same key. Store the original words in the group for that key. " +
    "For n words of at most k letters, sorting takes O(nk log(k + 1)) time. The groups and their keys use O(n(k + 1)) space.",
} satisfies CatalogAlgorithmDefinition;
