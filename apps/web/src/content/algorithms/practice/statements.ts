import type { ComponentType } from "react";
export const problemStatements: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "most-frequent-character": () =>
    import("./most-frequent-character/problem.mdx"),
  "valid-anagram": () => import("./valid-anagram/problem.mdx"),
  "longest-substring-two-distinct": () =>
    import("./longest-substring-two-distinct/problem.mdx"),
  "move-zeroes": () => import("./move-zeroes/problem.mdx"),
  "max-consecutive-ones": () => import("./max-consecutive-ones/problem.mdx"),
  "valid-palindrome": () => import("./valid-palindrome/problem.mdx"),
  "longest-unique-substring": () =>
    import("./longest-unique-substring/problem.mdx"),
  "find-difference-two-arrays": () =>
    import("./find-difference-two-arrays/problem.mdx"),
  "merge-strings-alternately": () =>
    import("./merge-strings-alternately/problem.mdx"),
  "longest-consecutive-sequence": () =>
    import("./longest-consecutive-sequence/problem.mdx"),
  "sort-array-by-increasing-frequency": () =>
    import("./sort-array-by-increasing-frequency/problem.mdx"),
  "group-anagrams": () => import("./group-anagrams/problem.mdx"),
  "remove-duplicates-from-sorted-array": () =>
    import("./remove-duplicates-from-sorted-array/problem.mdx"),
  "count-pairs-with-sum": () => import("./count-pairs-with-sum/problem.mdx"),
  "maximum-sum-subarray-of-size-k": () =>
    import("./maximum-sum-subarray-of-size-k/problem.mdx"),
  "reverse-vowels-of-a-string": () =>
    import("./reverse-vowels-of-a-string/problem.mdx"),
  "rotate-image": () => import("./rotate-image/problem.mdx"),
  "spiral-matrix": () => import("./spiral-matrix/problem.mdx"),
  "longest-substring-without-repeating-characters": () =>
    import("./longest-substring-without-repeating-characters/problem.mdx"),
};
