# Data model

Public Problem: ID javascript.sleep, slug sleep, subject javascript, topic async, title Sleep, Easy level, starter source, entry function sleep, sample inputs100/200, constraints1–1000, hints and explanatory solution. Trusted statement MDX is separate server content.

ExecutionRequest: problemId, action run|submit, source code, run-only visible numeric inputs (1–1000,max5). Submit ignores browser cases and uses API-private suite.

ExecutionResult: unique attempt ID, action, actual verdict, passed/total counts, visible case diagnostics and hidden failure label. Never serialize private input/expected/actual/logs. Error responses contain a short safe message, not a fabricated verdict.

ProblemSession: source and source revision snapshot; retained EditorState; selected left/output/case tabs; visible cases; pending request/controller; latest result/source/input snapshot; actual submission attempts capped20. Session-local, not a database record. LayoutPreferences remain existing version1 browser dimensions only.

State: idle → running/submitting → verdict or request error. Editing during execution retains source and marks older results stale. Reset code restores starter; reset layout never changes source/results. Leaving problem aborts in-flight work.
