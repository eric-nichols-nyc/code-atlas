"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  LayersIcon,
  SearchIcon,
  StarIcon,
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
import Link from "next/link";
import { useId, useState } from "react";
import { learningTopics as javascriptLearningTopics } from "@/content/javascript/learn/catalog";
import { DifficultyBadge } from "@/features/catalog/components/difficulty-badge";
import {
  learningCategories,
  learningModuleHref,
  learningModules,
} from "../lib/learn-catalog";
import {
  type LearningModule,
  type LearningTopic,
  learningDifficulties,
} from "../lib/learn-types";

export function LearningCatalog({
  catalog,
  title = "JavaScript Learn",
  topics: learningTopics = javascriptLearningTopics,
  basePath = "/javascript/learn",
}: {
  catalog: readonly LearningModule[];
  title?: string;
  topics?: readonly LearningTopic[];
  basePath?: string;
}) {
  const [category, setCategory] = useState("recommended");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const searchId = useId();
  const difficultyId = useId();
  const categories = learningCategories(catalog, learningTopics);
  const selected =
    categories.find((item) => item.id === category) ?? categories[0];
  const selectedId = selected?.id ?? "recommended";
  const rows = learningModules(catalog, selectedId, query, difficulty);
  const filtersActive = Boolean(query.trim()) || difficulty !== "all";
  const hasModules = catalog.some((entry) => entry.status === "published");

  return (
    <main className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-1 flex-col gap-11 px-5 pt-6 pb-8 md:px-8 md:pt-14 lg:px-14">
      <header className="max-w-2xl">
        <h1 className="text-[28px] leading-9 font-semibold tracking-tight md:text-[40px] md:leading-[50px]">
          {title}
        </h1>
      </header>
      <Tabs
        orientation="vertical"
        value={selectedId}
        onValueChange={setCategory}
        className="min-w-0 flex-col gap-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start"
      >
        <aside
          className="flex min-w-0 flex-col gap-3"
          aria-label="Module categories"
        >
          <h2 className="text-sm font-medium">Categories</h2>
          <TabsList
            variant="panel"
            aria-label="Module categories"
            className="w-full"
          >
            {categories.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="min-h-[45px] gap-3 px-3"
              >
                {item.id === "recommended" ? (
                  <StarIcon
                    aria-hidden="true"
                    data-icon="inline-start"
                    className="text-category-recommended"
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

        <TabsContent value={selectedId} className="flex min-w-0 flex-col gap-3">
          <p role="status" className="text-right text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "module" : "modules"}
          </p>
          <section
            className="@container/learn min-w-0 overflow-hidden rounded-md border bg-card"
            aria-label={selected?.heading ?? "Recommended modules"}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-5 sm:px-5 @min-[700px]/learn:flex-nowrap">
              <h2 className="min-w-0 text-xl leading-7 font-semibold @min-[700px]/learn:shrink-0">
                {selected?.heading}
              </h2>
              <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center @min-[700px]/learn:max-w-[480px] @min-[700px]/learn:flex-1">
                <Label htmlFor={difficultyId} className="sr-only">
                  Difficulty
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger
                    id={difficultyId}
                    size="sm"
                    className="w-full rounded-none sm:w-[148px] sm:shrink-0"
                    aria-label="Difficulty"
                  >
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectGroup>
                      <SelectItem value="all">Difficulty</SelectItem>
                      {learningDifficulties.map((level) => (
                        <SelectItem key={level} value={level}>
                          <DifficultyBadge difficulty={level} />
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="relative w-full min-w-0 sm:w-80 @min-[700px]/learn:flex-1">
                  <SearchIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Label htmlFor={searchId} className="sr-only">
                    Search modules
                  </Label>
                  <Input
                    id={searchId}
                    type="search"
                    placeholder="Search modules…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-11 rounded-none pl-11"
                  />
                </div>
              </div>
            </div>
            <Table aria-label="Learning modules" className="table-fixed">
              <TableHeader>
                <TableRow className="h-[44.5px]">
                  <TableHead scope="col" className="px-3 sm:px-5">
                    Module
                  </TableHead>
                  <TableHead scope="col" className="w-20 px-2 sm:w-28 sm:px-0">
                    Difficulty
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="hidden px-3 sm:table-cell sm:w-[190px] sm:px-0"
                  >
                    Topic
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="w-16 px-2 text-right whitespace-normal sm:w-32 sm:pr-5 sm:pl-0"
                  >
                    Lesson outlines
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((entry) => {
                    const href = learningModuleHref(entry, basePath);
                    const topic = learningTopics.find(
                      (item) => item.id === entry.topicId,
                    );
                    if (!href) return null;
                    return (
                      <TableRow
                        key={entry.id}
                        variant="striped"
                        className="h-[58px]"
                      >
                        <TableCell className="px-3 py-2 whitespace-normal sm:pr-0 sm:pl-5">
                          <div className="flex min-w-0 items-center">
                            <Link
                              href={href}
                              className="rounded-sm font-medium [overflow-wrap:anywhere] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                            >
                              {entry.title}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 py-2 sm:px-0">
                          <DifficultyBadge difficulty={entry.difficulty} />
                          <div className="mt-1 sm:hidden">
                            <Badge variant={topic?.variant}>
                              {topic?.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden px-3 py-2 sm:table-cell sm:px-0">
                          <Badge variant={topic?.variant}>{topic?.label}</Badge>
                        </TableCell>
                        <TableCell className="px-2 py-2 text-center sm:pr-5 sm:pl-0 sm:text-right">
                          {entry.lessonOutlines.length}
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
                        {!hasModules
                          ? "Learning modules are on the way. Check back soon."
                          : filtersActive
                            ? "No modules match your filters."
                            : "No modules in this category yet."}
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

export { LearningCatalog as JavaScriptLearn };
