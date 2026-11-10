"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ArrowRightIcon,
  BracesIcon,
  CodeXmlIcon,
  RotateCcwIcon,
} from "@workspace/ui/components/icons";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import Link from "next/link";
import { useRef, useState } from "react";
import { counterStarts, createDemoCounter } from "../lib/counter";

export function CounterPreview() {
  const [start, setStart] = useState<number>(10);
  const counter = useRef(createDemoCounter(10));
  const [history, setHistory] = useState<{
    count: number;
    entries: { call: number; value: number }[];
  }>({ count: 0, entries: [] });
  const latest = history.entries.at(-1)?.value;
  const reset = (nextStart = start) => {
    counter.current = createDemoCounter(nextStart);
    setStart(nextStart);
    setHistory({ count: 0, entries: [] });
  };
  const call = () => {
    const value = counter.current();
    setHistory((previous) => ({
      count: previous.count + 1,
      entries: [...previous.entries, { call: previous.count + 1, value }].slice(
        -3,
      ),
    }));
  };

  return (
    <Card
      className="min-w-0 gap-0 overflow-hidden py-0"
      aria-label="Interactive Counter example"
    >
      <CardHeader className="gap-y-1 border-b py-5">
        <CardTitle>
          <h2>A function that remembers.</h2>
        </CardTitle>
        <CardDescription className="col-start-1">
          One small example. A useful JavaScript idea.
        </CardDescription>
        <CardAction className="hidden sm:block">
          <Badge variant="amber">
            <BracesIcon aria-hidden="true" /> Interactive example
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid min-w-0 p-0 lg:grid-cols-[0.85fr_1.25fr_0.9fr]">
        <div className="flex flex-col gap-4 border-b p-6 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-2">
            <Badge variant="easy">Easy</Badge>
            <Badge variant="amber">Closures</Badge>
          </div>
          <h3 className="text-2xl font-semibold tracking-tight">Counter</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Create a function that returns the next number each time you call
            it. The interesting part? It remembers its own state.
          </p>
          <p className="mt-auto text-xs leading-5 text-muted-foreground">
            Try it here. No account needed for this example.
          </p>
        </div>
        <figure
          className="min-w-0 border-b lg:border-r lg:border-b-0"
          aria-label="Counter example source"
        >
          <figcaption className="flex items-center gap-2 border-b px-5 py-3 text-xs text-muted-foreground">
            <CodeXmlIcon className="size-4" aria-hidden="true" /> counter.js{" "}
            <span className="ml-auto">JavaScript</span>
          </figcaption>
          <pre className="overflow-x-auto px-5 py-6 font-mono text-[13px] leading-7 whitespace-pre-wrap [overflow-wrap:anywhere]">
            <code>
              <span className="text-[var(--code-keyword)]">function</span>
              {" createCounter(start) {\n"}
              {"  "}
              <span className="text-[var(--code-keyword)]">let</span>
              {" count = start;\n"}
              {"  "}
              <span className="text-[var(--code-keyword)]">return</span>
              {" () => count++;\n"}
              {"}\n\n"}
              <span className="text-[var(--code-keyword)]">const</span>
              {" counter = createCounter("}
              <span className="text-[var(--code-number)]">{start}</span>
              {");"}
            </code>
          </pre>
          <p className="border-t px-5 py-3 font-mono text-xs text-[var(--code-comment)]">
            {"// Same function. A new return value."}
          </p>
        </figure>
        <div className="flex min-w-0 flex-col p-6">
          <Tabs
            value={String(start)}
            onValueChange={(value) => {
              const next = counterStarts.find((n) => String(n) === value);
              if (next !== undefined) reset(next);
            }}
            className="min-w-0 gap-5"
          >
            <TabsList aria-label="Counter starting value" className="w-full">
              {counterStarts.map((value) => (
                <TabsTrigger
                  key={value}
                  value={String(value)}
                  aria-label={`Start at ${value}`}
                  className="motion-reduce:transition-none"
                >
                  n = {value}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={String(start)} className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Return value</span>
                <span>
                  {history.count} {history.count === 1 ? "call" : "calls"}
                </span>
              </div>
              <output
                aria-label="Latest counter return"
                aria-live="polite"
                className="block min-h-16 font-mono text-5xl leading-tight font-medium tracking-tight text-category-closures"
              >
                {latest ?? "—"}
              </output>
              <div className="min-h-[84px]">
                {history.count ? (
                  <ol
                    aria-label="Recent counter calls"
                    className="flex flex-col gap-1 font-mono text-xs text-muted-foreground"
                  >
                    {history.entries.map((entry) => (
                      <li
                        key={entry.call}
                        className="flex justify-between gap-3"
                      >
                        <span>
                          counter(){" "}
                          <span className="text-muted-foreground/60">
                            #{entry.call}
                          </span>
                        </span>
                        <span className="text-foreground">{entry.value}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm leading-6 text-muted-foreground">
                    Call it once. Then call it again.
                    <br />
                    Notice what stays with the function.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={call} className="flex-1">
                  <CodeXmlIcon data-icon="inline-start" aria-hidden="true" />
                  Call counter()
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => reset()}
                  aria-label="Reset counter"
                  title="Reset counter"
                >
                  <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-3 border-t pb-5">
        <p className="text-xs text-muted-foreground">
          That memory is a closure. Now try writing one yourself.
        </p>
        <Button asChild variant="link" size="sm">
          <Link href="/javascript/practice/counter" prefetch={false}>
            Open Counter problem
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
