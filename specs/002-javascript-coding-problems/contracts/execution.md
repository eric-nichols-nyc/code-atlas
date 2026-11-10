# Execution contract

POST /v1/problems/javascript.sleep/run: authenticated JSON {code,inputs?}; inputs default public samples. POST /v1/problems/javascript.sleep/submit: authenticated JSON {code}, private suite selected on server. Other IDs404; invalid input400; no session401; missing config503; rate/queue429; unavailable judge503. Same-origin web BFF is /api/problems/[problemId]/[action] and independently verifies session.

Verdicts: accepted, wrong-answer, compile-error, runtime-error, time-limit-exceeded. A request/host outage is not a judged verdict. Results carry action, attemptId, passed,total, visible case results; Submit failure can identify hiddenCase:true but omits every hidden input/output/log. Actual full-suite checks complete before accepted.

Sleep must return a pending Promise and settle approximately after each input. The judged value can be anything. Host timing, not guest-reported timing, determines result. No imports, Node modules or network APIs are supported. Timers and console are bounded. All source runs in the separate QuickJS guest, never application eval.
