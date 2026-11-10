# Research: coding workspace correction

## Reference evidence

CodeDrill source, inspected 2026-11-09:

- apps/app/features/problem-workspace/components/editor-panel/components/monaco-editor.tsx: controlled lazy Monaco, syntax/language and editor options.
- editor-panel/hooks/use-problem-workspace.ts: handleRun evaluates current source and opens Test Result; handleSubmit only appends placeholder messages. It is not a real judge.
- lib/client-test-run.ts: direct new Function evaluation, JSON comparison and console capture; no Worker/CPU timeout/isolation. Do not transfer this execution boundary.
- output-panel/components/testcase-panel.tsx and test-result-panel.tsx: individual cases, expected/actual/error/stdout.
- apps/api/src/problems/problems.service.ts: current detail response selects all test rows; a new implementation must explicitly separate public/private suites.

## Editor decision

Use native CodeMirror6, loaded on demand, with local packages and no CDN. It supplies required JS editing without Monaco worker/CDN integration. Preserve source and EditorState above layout remounts; use a theme Compartment rather than recreate on theme change. Keep Tab navigation available. Sources: [setup](https://codemirror.net/examples/basic/), [configuration](https://codemirror.net/examples/config/), [styling](https://codemirror.net/examples/styling/), [Tab accessibility](https://codemirror.net/examples/tab/), [Monaco alternative](https://github.com/microsoft/monaco-editor/blob/main/docs/integrate-esm.md). Registry pins were verified by the editor research agent.

## Execution decision

Use [quickjs-emscripten 0.32.0](https://www.npmjs.com/package/quickjs-emscripten), a separate guest runtime inside a static disposable Node Worker. Worker alone is not a sandbox. QuickJS receives no host I/O/module/credential APIs. Worker native resourceLimits do not cap ArrayBuffers/WASM; enforce the guest memory limit separately. [Runtime API](https://github.com/justjake/quickjs-emscripten/blob/v0.32.0/doc/quickjs-emscripten/classes/QuickJSRuntime.md), [Node Workers](https://nodejs.org/docs/latest-v24.x/api/worker_threads.html#new-workerfilename-options).

Inspect getPromiseState: nonPromise fulfillment has notAPromise:true and aliases the original handle; do not double-dispose it. Real fulfillment/rejection handles are owned. Pump executePendingJobs(32), dispose its result and yield to host. Retain duplicated timer callback handles only until fired/cancelled and dispose during cleanup. Avoid dumping arbitrary guest objects into host strings. Bound every guest entry and accumulated CPU separately from idle wait. [Exact API implementation](https://github.com/justjake/quickjs-emscripten/blob/v0.32.0/packages/quickjs-emscripten-core/src/context.ts), [memory management](https://github.com/justjake/quickjs-emscripten/blob/v0.32.0/README.md#memory-management).

Use host monotonic timing; guest Date is untrusted and exact timer duration is not guaranteed. [performance.now](https://nodejs.org/docs/latest-v24.x/api/perf_hooks.html#performancenow), [timer guarantees](https://nodejs.org/api/timers.html#settimeoutcallback-delay-args). No new external judge credentials or database are required for real session-local verdicts. Managed container judging can replace this adapter if future requirements add Node modules, other languages or stronger deployment separation.
