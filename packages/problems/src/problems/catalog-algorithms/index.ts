import type { CatalogAlgorithmDefinition } from "../../types.js";
import { countPairsWithSumProblem } from "./count-pairs-with-sum.js";
import { findDifferenceTwoArraysProblem } from "./find-difference-two-arrays.js";
import { groupAnagramsProblem } from "./group-anagrams.js";
import { longestConsecutiveSequenceProblem } from "./longest-consecutive-sequence.js";
import { longestSubstringWithoutRepeatingCharactersProblem } from "./longest-substring-without-repeating-characters.js";
import { longestUniqueSubstringProblem } from "./longest-unique-substring.js";
import { maximumSumSubarrayOfSizeKProblem } from "./maximum-sum-subarray-of-size-k.js";
import { mergeStringsAlternatelyProblem } from "./merge-strings-alternately.js";
import { removeDuplicatesFromSortedArrayProblem } from "./remove-duplicates-from-sorted-array.js";
import { reverseVowelsOfAStringProblem } from "./reverse-vowels-of-a-string.js";
import { rotateImageProblem } from "./rotate-image.js";
import { sortArrayByIncreasingFrequencyProblem } from "./sort-array-by-increasing-frequency.js";
import { spiralMatrixProblem } from "./spiral-matrix.js";
import { validPalindromeProblem } from "./valid-palindrome.js";

export const catalogAlgorithmProblems: CatalogAlgorithmDefinition[] = [
  validPalindromeProblem,
  longestUniqueSubstringProblem,
  findDifferenceTwoArraysProblem,
  mergeStringsAlternatelyProblem,
  longestConsecutiveSequenceProblem,
  sortArrayByIncreasingFrequencyProblem,
  groupAnagramsProblem,
  removeDuplicatesFromSortedArrayProblem,
  countPairsWithSumProblem,
  maximumSumSubarrayOfSizeKProblem,
  reverseVowelsOfAStringProblem,
  rotateImageProblem,
  spiralMatrixProblem,
  longestSubstringWithoutRepeatingCharactersProblem,
];
