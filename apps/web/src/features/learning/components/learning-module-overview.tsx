import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon } from "@workspace/ui/components/icons";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { learningTopics as javascriptLearningTopics } from "@/content/javascript/learn/catalog";
import { DifficultyBadge } from "@/features/catalog/components/difficulty-badge";
import type { LearningModule, LearningTopic } from "../lib/learn-types";
import styles from "./learning-module-overview.module.css";

export function LearningModuleOverview({
  module,
  children,
  topics = javascriptLearningTopics,
  basePath = "/javascript/learn",
}: {
  module: LearningModule;
  children: ReactNode;
  topics?: readonly LearningTopic[];
  basePath?: string;
}) {
  const topic = topics.find((item) => item.id === module.topicId);
  return (
    <main className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-1 flex-col gap-7 px-5 py-8 md:px-8 md:py-14 lg:px-14">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href={basePath}>
            <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
            Back to Learn
          </Link>
        </Button>
      </div>
      <header className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Module preview</Badge>
          <DifficultyBadge difficulty={module.difficulty} />
          <Badge variant={topic?.variant}>{topic?.label}</Badge>
        </div>
        <h1 className="text-[28px] leading-9 font-semibold tracking-tight md:text-[40px] md:leading-[50px]">
          {module.title}
        </h1>
        <p className="text-sm leading-[23px] text-muted-foreground">
          {module.summary}
        </p>
        <p className="text-sm leading-[23px] text-muted-foreground">
          Explore the pattern with a guided code example. Individual lessons and
          interactive exercises are coming later.
        </p>
      </header>
      <article
        className={cn("min-w-0 rounded-md border bg-card p-5", styles.prose)}
        aria-label={`${module.title} introduction and example`}
      >
        {children}
      </article>
    </main>
  );
}
