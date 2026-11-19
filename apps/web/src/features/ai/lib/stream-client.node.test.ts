import { expect, it } from "vitest";
import type { AiTextEvent } from "./contract";
import { readAiTextStream } from "./stream-client";

const response = (text: string, finish = true) =>
  new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of new TextEncoder().encode(text))
          controller.enqueue(Uint8Array.of(byte));
        if (finish) controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
it("reads byte-split UTF-8 and SSE frames through confirmed completion", async () => {
  const events: AiTextEvent[] = [];
  await readAiTextStream(
    response(
      'data: {"type":"start"}\n\ndata: {"type":"delta","text":"Try café ☕"}\n\ndata: {"type":"done"}\n\n',
    ),
    (event) => events.push(event),
    new AbortController().signal,
  );
  expect(events).toEqual([
    { type: "start" },
    { type: "delta", text: "Try café ☕" },
    { type: "done" },
  ]);
});
it("rejects failed, empty, disconnected, invalid and oversized streams without retrying", async () => {
  for (const text of [
    'data: {"type":"delta","text":"partial"}\n\n',
    'data: {"type":"done"}\n\n',
    'data: {"type":"error","message":"Try again"}\n\n',
    'data: {"type":"tool_call"}\n\n',
    `data: ${JSON.stringify({ type: "delta", text: "x".repeat(65537) })}\n\n`,
  ])
    await expect(
      readAiTextStream(response(text), () => {}, new AbortController().signal),
    ).rejects.toThrow();
  await expect(
    readAiTextStream(
      Response.json(
        { error: "Sign in to access this resource." },
        { status: 401 },
      ),
      () => {},
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ status: 401 });
});
