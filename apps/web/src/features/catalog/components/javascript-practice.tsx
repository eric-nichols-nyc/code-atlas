"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  BracesIcon,
  CircleCheckIcon,
  CircleIcon,
  FlagIcon,
  LayersIcon,
  SearchIcon,
  StarIcon,
  TimerIcon,
} from "@workspace/ui/components/icons";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { useId, useState } from "react";
import { problemHref, topics } from "../../learning/lib/catalog";
import {
  type PracticeEntry,
  practiceCategories,
  practiceProblems,
} from "../lib/practice-catalog";
import { usePracticeRecords } from "../state/practice-records";
import { DifficultyBadge } from "./difficulty-badge";

export function JavaScriptPractice({
  catalog,
  learnerId,
}: {
  catalog: PracticeEntry[];
  learnerId?: string;
}) {
  const records = usePracticeRecords(learnerId);
  const [category, setCategory] = useState("recommended");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const searchId = useId();
  const difficultyId = useId();
  const categories = practiceCategories(catalog);
  const selected =
    categories.find((item) => item.id === category) ?? categories[0];
  const selectedId = selected?.id ?? "recommended";
  const rows = practiceProblems(catalog, selectedId, query, difficulty);
  const filtersActive = Boolean(query.trim()) || difficulty !== "all";
  const hasProblems = catalog.some((entry) => entry.status === "published");

  return (
    <main className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-1 flex-col gap-8 px-5 py-8 md:px-6 md:py-10">
      <header className="max-w-2xl">
        <h1 className="text-[28px] leading-9 font-semibold tracking-tight md:text-4xl md:leading-11">
          JavaScript practice
        </h1>
      </header>
      {records.error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm text-muted-foreground"
        >
          <p>{records.error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void records.reload()}
          >
            Retry progress
          </Button>
        </div>
      )}

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
                {item.id === "recommended" ? (
                  <StarIcon
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="text-category-recommended"
                  />
                ) : item.id === "async" ? (
                  <TimerIcon
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="text-category-async"
                  />
                ) : item.id === "closures" ? (
                  <BracesIcon
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="text-category-closures"
                  />
                ) : item.id === "arrays" ? (
                  <LayersIcon
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="text-category-arrays"
                  />
                ) : null}
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
            className="min-w-0 overflow-hidden rounded-md border bg-card"
            aria-label={selected?.heading ?? "Recommended problems"}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-5 sm:px-5">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-[22px] leading-[30px] font-semibold">
                  {selected?.heading}
                </h2>
                <p role="status" className="text-sm text-muted-foreground">
                  {rows.length} {rows.length === 1 ? "problem" : "problems"}
                </p>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row">
                <Label htmlFor={difficultyId} className="sr-only">
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger
                    id={difficultyId}
                    className="w-full sm:w-40"
                    aria-label="Difficulty"
                  >
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All difficulties</SelectItem>
                      {["Easy", "Medium", "Hard"].map((level) => (
                        <SelectItem key={level} value={level}>
                          <DifficultyBadge difficulty={level} />
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-64">
                  <SearchIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Label htmlFor={searchId} className="sr-only">
                    Search problems
                  </Label>
                  <Input
                    id={searchId}
                    type="search"
                    placeholder="Search problems…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <Table aria-label="Practice problems" className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="px-3 sm:px-5">
                    Problem
                  </TableHead>
                  <TableHead scope="col" className="w-20 px-2 sm:w-28 sm:px-5">
                    Difficulty
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="hidden px-3 sm:table-cell sm:w-36 sm:px-5"
                  >
                    Topic
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="w-10 px-2 text-center sm:w-20 sm:px-3"
                  >
                    <span className="sr-only sm:not-sr-only">Solved</span>
                    <CircleCheckIcon
                      aria-hidden="true"
                      className="mx-auto size-4 sm:hidden"
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((entry) => {
                    const href = problemHref(entry);
                    const topic = topics.find(
                      (item) => item.id === entry.topicId,
                    );
                    if (!href) return null;
                    const flagged = records.flagged.includes(entry.id);
                    const solved = records.solved.includes(entry.id);
                    const legacy = records.legacySolved.includes(entry.id);
                    const SolvedIcon = solved ? CircleCheckIcon : CircleIcon;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="px-3 py-4 whitespace-normal sm:px-5">
                          <div className="flex min-w-0 items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={
                                !records.ready ||
                                records.pending.includes(entry.id)
                              }
                              aria-label={`${flagged ? "Unflag" : "Flag"} ${entry.title}`}
                              aria-pressed={flagged}
                              title={
                                records.pending.includes(entry.id)
                                  ? "Saving flag to your account…"
                                  : flagged
                                    ? records.synced
                                      ? "Flagged in your account — click to unflag"
                                      : "Flag kept in this browser — waiting to sync"
                                    : "Flag for later in your account"
                              }
                              onClick={() => records.toggleFlag(entry.id)}
                            >
                              <FlagIcon
                                aria-hidden="true"
                                data-icon="inline-start"
                                className={cn(
                                  "text-muted-foreground",
                                  flagged && "fill-current text-destructive",
                                )}
                              />
                            </Button>
                            <Link
                              href={href}
                              className="rounded-sm font-medium [overflow-wrap:anywhere] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                            >
                              {entry.title}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-4 sm:px-5">
                          <DifficultyBadge difficulty={entry.difficulty} />
                          <div className="mt-1 sm:hidden">
                            <Badge variant={topic?.variant}>
                              {topic?.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden px-3 py-4 sm:table-cell sm:px-5">
                          <Badge variant={topic?.variant}>{topic?.label}</Badge>
                        </TableCell>
                        <TableCell className="px-2 py-4 text-center sm:px-3">
                          <span
                            role="img"
                            aria-label={`${entry.title}: ${!records.ready ? "loading status" : solved ? "solved in your account" : legacy ? "previous browser completion, unverified" : "not solved"}`}
                            title={
                              solved
                                ? "Accepted Submit saved to your account"
                                : legacy
                                  ? "Previous browser completion retained; submit Accepted to verify it"
                                  : "Submit an accepted solution to mark solved"
                            }
                            className="inline-flex"
                          >
                            <SolvedIcon
                              aria-hidden="true"
                              className={cn(
                                "size-4 text-muted-foreground",
                                solved && "text-difficulty-easy",
                              )}
                            />
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="px-4 py-10 text-center whitespace-normal"
                    >
                      <p className="text-sm text-muted-foreground">
                        {!hasProblems
                          ? "Practice problems are on the way. Check back soon."
                          : filtersActive
                            ? "No problems match your filters."
                            : "No problems in this category yet."}
                      </p>
                      {filtersActive && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setQuery("");
                            setDifficulty("all");
                          }}
                        >
                          {difficulty === "all"
                            ? "Clear search"
                            : "Clear filters"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
}
