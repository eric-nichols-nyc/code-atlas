"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import Link from "next/link";
import { useId, useState } from "react";
import { problemHref, topics } from "../../learning/lib/catalog";
import {
  type PracticeEntry,
  practiceCategories,
  practiceProblems,
} from "../lib/practice-catalog";

export function JavaScriptPractice({ catalog }: { catalog: PracticeEntry[] }) {
  const [category, setCategory] = useState("recommended");
  const [query, setQuery] = useState("");
  const searchId = useId();
  const categories = practiceCategories(catalog);
  const selected =
    categories.find((item) => item.id === category) ?? categories[0];
  const selectedId = selected?.id ?? "recommended";
  const rows = practiceProblems(catalog, selectedId, query);
  const hasProblems = catalog.some((entry) => entry.status === "published");

  return (
    <main className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-1 flex-col gap-8 px-5 py-8 md:px-6 md:py-10">
      <header className="max-w-2xl">
        <h1 className="text-[28px] leading-9 font-semibold tracking-tight md:text-4xl md:leading-11">
          JavaScript practice
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Build fluency through focused JavaScript problems.
        </p>
      </header>

      <Tabs
        orientation="vertical"
        value={selectedId}
        onValueChange={setCategory}
        className="min-w-0 flex-col gap-6 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:gap-8"
      >
        <aside
          className="flex min-w-0 flex-col gap-3"
          aria-label="Problem categories"
        >
          <h2 className="text-sm font-medium">Categories</h2>
          <TabsList aria-label="Problem categories" className="w-full">
            {categories.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="min-h-11 gap-3 px-3"
              >
                <span className="min-w-0 flex-1 truncate text-left">
                  {item.label}
                </span>
                <Badge variant="secondary" aria-hidden="true">
                  {item.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </aside>

        <TabsContent value={selectedId} className="min-w-0">
          <section
            className="flex min-w-0 flex-col gap-5"
            aria-label={selected?.heading ?? "Recommended problems"}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[22px] leading-[30px] font-semibold">
                {selected?.heading}
              </h2>
              <p role="status" className="text-sm text-muted-foreground">
                {rows.length} {rows.length === 1 ? "problem" : "problems"}
              </p>
            </div>
            <div>
              <Label htmlFor={searchId} className="mb-2">
                Search problems
              </Label>
              <Input
                id={searchId}
                type="search"
                placeholder="Search problems…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            {rows.length ? (
              <ol className="overflow-hidden rounded-md border">
                {rows.map((entry) => {
                  const href = problemHref(entry);
                  const topic = topics.find(
                    (item) => item.id === entry.topicId,
                  );
                  if (!href) return null;
                  return (
                    <li key={entry.id} className="border-b last:border-b-0">
                      <Link
                        href={href}
                        className="flex min-h-[84px] min-w-0 items-center gap-3 bg-card px-4 py-4 hover:bg-accent focus-visible:relative focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:gap-4 sm:px-5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-sm font-medium sm:text-[15px]">
                              {entry.title}
                            </span>
                            <Badge
                              variant={topic?.variant}
                              className="shrink-0"
                            >
                              {topic?.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                            {entry.summary}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {entry.difficulty}
                        </Badge>
                        <span
                          className="hidden text-muted-foreground sm:inline"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="rounded-md border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {!hasProblems
                    ? "Practice problems are on the way. Check back soon."
                    : query.trim()
                      ? "No problems match your search."
                      : "No problems in this category yet."}
                </p>
                {query && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
}
