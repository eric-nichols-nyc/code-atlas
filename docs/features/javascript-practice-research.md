# JavaScript practice expansion: research

Researched 2026-11-11 against official problem statements and JavaScript references.
The five additions complement the existing Filter, Flatten, Counter and Curry
problems: three array operations and two closure-based function utilities.
All learner-facing prose, examples and reference implementations are authored for
Code Atlas. This note records the source concepts and the deliberate adaptations.

| Problem              | Learning outcome                                                                               | Primary exercise reference                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Map Array            | Invoke a callback with the value and original index; collect every result into a new array.    | [Apply Transform Over Each Element in Array, 2635](https://leetcode.com/problems/apply-transform-over-each-element-in-array/) |
| Reduce Array         | Carry an initial accumulator through a left-to-right callback sequence, including empty input. | [Array Reduce Transformation, 2626](https://leetcode.com/problems/array-reduce-transformation/)                               |
| Chunk Array          | Partition consecutive values into groups, allowing a short final group.                        | [Chunk Array, 2677](https://leetcode.com/problems/chunk-array/)                                                               |
| Function Composition | Build a reusable right-to-left composition, with identity for an empty list.                   | [Function Composition, 2629](https://leetcode.com/problems/function-composition/)                                             |
| Memoize              | Cache by the complete ordered argument list and observe calls avoided on cache hits.           | [Memoize, 2623](https://leetcode.com/problems/memoize/)                                                                       |

## JavaScript semantics and design decisions

- **Mapping:** MDN describes a new array populated by callback results, with
  original indices available to the callback. The Code Atlas exercise uses dense
  integer arrays, requires one callback call per element in ascending order and
  disables `map` to make the traversal visible. Sparse arrays, callback mutation
  and the broader generic built-in API are outside this contract.
  [MDN: Array.prototype.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
- **Reduction:** With an explicit initial value, accumulation starts at the first
  element, and an empty array returns that initial value without callback calls.
  Code Atlas always supplies `init` and disables both reduction built-ins. The
  judge should check call order independently of the numeric result: several
  supplied arithmetic reducers can produce the same result under reversed input.
  [MDN: Array.prototype.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).
- **Chunking:** `slice` copies a selected range without changing the source.
  It is an allowed implementation tool here. The Code Atlas contract also requires
  fresh outer/group arrays and forbids empty trailing groups.
  [MDN: Array.prototype.slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice).
- **Composition and memoization:** Closures retain access to their defining lexical
  environment. Keep traversal state local to each composed invocation and one
  independent cache per call to `memoize`.
  [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures).
- **Cache presence:** A stored result of zero is still present, so use membership
  rather than result truthiness. `Map.has` distinguishes a missing entry from a
  stored value. The integer-array-only input contract allows a serialized ordered
  argument list as a key; this is not a general object-identity memoizer.
  [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

## Code Atlas adaptations

Map and Reduce use supplied callback selectors with visible source. Composition
accepts an ordered list of supplied callback names. Memoize supplies variadic
`sum`/`product` and two-argument `subtract` instead of the reference exercise's
recursive callbacks; its driver reports `{values, callCount}`. This makes argument
arity/order, empty calls and cached zero visible without introducing recursion
costs into the memoization exercise.

Array lengths, call counts, function-list lengths and numeric values are bounded
for the existing isolated QuickJS runtime. These limits are Code Atlas policies,
not claims about the full JavaScript built-ins. The worker must still verify
callback invocation counts, order, independent closures, input preservation and
bounded output, with private Submit cases kept server-only. No database model or
authentication changes are required.
