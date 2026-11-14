"use client";
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble";
import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import {
  Message,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@workspace/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui/components/message-scroller";
import { Separator } from "@workspace/ui/components/separator";
import { Textarea } from "@workspace/ui/components/textarea";
import Link from "next/link";
import { useId } from "react";
import Markdown from "react-markdown";
import { useProblemTutor } from "../state/problem-tutor";

export function TutorAnswer({ children }: { children: string }) {
  return (
    <div className="tutor-markdown">
      <Markdown
        skipHtml
        disallowedElements={["img"]}
        urlTransform={(value) => {
          try {
            const url = new URL(value);
            return url.protocol === "https:" && !url.username && !url.password
              ? url.href
              : "";
          } catch {
            return "";
          }
        }}
        components={{
          a: ({ children, href }) =>
            href ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <span>{children}</span>
            ),
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
export function ProblemTutor() {
  const s = useProblemTutor();
  const id = useId();
  const latest = s.turns.at(-1);
  const status = s.busy
    ? latest?.status === "streaming"
      ? "Receiving a tutor reply…"
      : "Asking the tutor…"
    : latest?.status === "completed"
      ? "Tutor reply complete."
      : "";
  return (
    <section
      aria-label="AI tutor"
      className="flex h-full min-h-0 min-w-0 flex-col"
    >
      <div className="min-h-0 flex-1">
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport
              aria-label="Tutor conversation"
              role="log"
              aria-live="off"
              tabIndex={0}
            >
              <MessageScrollerContent className="gap-5 p-3">
                {s.turns.length === 0 && (
                  <div className="flex flex-col gap-2 py-3">
                    <p className="text-sm font-semibold">
                      A little guidance, when you need it.
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Ask about a line, an error, or what to try next. Start
                      with “I'm stuck here” — your current code comes along.
                    </p>
                  </div>
                )}
                {s.turns.map((turn) => (
                  <MessageScrollerItem
                    key={turn.id}
                    messageId={turn.id}
                    scrollAnchor
                  >
                    <div
                      className="flex min-w-0 flex-col gap-4"
                      data-testid="tutor-turn"
                      data-status={turn.status}
                    >
                      <Message align="end">
                        <MessageContent>
                          <MessageHeader>You</MessageHeader>
                          <Bubble variant="muted" align="end">
                            <BubbleContent className="whitespace-pre-wrap">
                              {turn.question}
                            </BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                      <Message>
                        <MessageContent>
                          <MessageHeader>AI tutor</MessageHeader>
                          <Bubble variant="ghost">
                            <BubbleContent>
                              {turn.answer ? (
                                <TutorAnswer>{turn.answer}</TutorAnswer>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {turn.status === "sending"
                                    ? "Thinking about your code…"
                                    : "No completed reply."}
                                </p>
                              )}
                            </BubbleContent>
                          </Bubble>
                          {turn.source !== s.source && (
                            <MessageFooter>
                              Code changed since this question.
                            </MessageFooter>
                          )}
                          {turn.error && <FieldError>{turn.error}</FieldError>}
                          {turn.signIn && (
                            <Button asChild variant="outline" size="sm">
                              <Link href="/sign-in">Sign in again</Link>
                            </Button>
                          )}
                          {(turn.status === "failed" ||
                            turn.status === "stopped") && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={s.busy}
                              onClick={() => void s.retry(turn)}
                            >
                              Retry with current code
                            </Button>
                          )}
                        </MessageContent>
                      </Message>
                    </div>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <Separator />
      <form
        aria-label="Ask the AI tutor"
        className="flex shrink-0 flex-col gap-3 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void s.send();
        }}
      >
        <FieldGroup className="gap-3">
          <Field data-invalid={Boolean(s.error)}>
            <FieldLabel htmlFor={id}>Your question</FieldLabel>
            <Textarea
              id={id}
              rows={3}
              value={s.draft}
              onChange={(event) => s.setDraft(event.target.value)}
              aria-invalid={Boolean(s.error)}
              aria-describedby={`${id}-context`}
              placeholder="I'm stuck here…"
              className="max-h-32 resize-none"
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  (event.metaKey || event.ctrlKey) &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  event.stopPropagation();
                  void s.send();
                }
              }}
            />
            {s.error && <FieldError>{s.error}</FieldError>}
          </Field>
        </FieldGroup>
        <p
          id={`${id}-context`}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          Your current code and this problem are included when you send. Chat
          lasts for this visit.
        </p>
        {s.historyTrimmed && (
          <p className="text-xs text-muted-foreground">
            Only recent exchanges are included; earlier messages remain here.
          </p>
        )}
        {s.feedbackOmitted && (
          <p className="text-xs text-muted-foreground">
            Earlier or oversized Run feedback was left out.
          </p>
        )}
        <div className="flex min-h-8 items-center justify-between gap-2">
          <p
            role="status"
            aria-live="polite"
            className="text-xs text-muted-foreground"
          >
            {status}
          </p>
          {s.busy ? (
            <Button type="button" variant="outline" size="sm" onClick={s.stop}>
              Stop reply
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={!s.draft.trim()}>
              Send question
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
