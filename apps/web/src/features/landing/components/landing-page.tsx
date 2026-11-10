import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Badge } from "@workspace/ui/components/badge";
import { BrandIcon } from "@workspace/ui/components/brand-icon";
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
  ArrowUpRightIcon,
  BracesIcon,
  CodeXmlIcon,
  LayersIcon,
  TimerIcon,
} from "@workspace/ui/components/icons";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { javascriptPracticeCatalog } from "@/content/javascript/practice/catalog";
import { DifficultyBadge } from "@/features/catalog/components/difficulty-badge";
import { subjects } from "@/features/catalog/data/subjects";
import { practiceProblems } from "@/features/catalog/lib/practice-catalog";
import { topics } from "@/features/learning/lib/catalog";
import { landingQuestions, practiceSteps } from "../data/content";
import { CounterPreview } from "./counter-preview";
import styles from "./landing-page.module.css";

const topicIcons = {
  closures: BracesIcon,
  arrays: LayersIcon,
  async: TimerIcon,
};

export function LandingPage({
  startHref,
}: {
  startHref: "/sign-in" | "/dashboard";
}) {
  const published = practiceProblems(javascriptPracticeCatalog, "recommended");
  const javascript = subjects.find((subject) => subject.id === "javascript");
  const upcoming = subjects.filter((subject) => subject.id !== "javascript");
  const topicCount = new Set(published.map((problem) => problem.topicId)).size;
  return (
    <main
      className={cn(
        styles.copy,
        "mx-auto flex w-full max-w-[1200px] min-w-0 flex-1 flex-col gap-20 px-5 pt-16 pb-8 md:gap-24 md:px-6 md:pt-22",
      )}
    >
      <section
        aria-labelledby="home-title"
        className="flex flex-col items-center gap-6 text-center"
      >
        <div className={cn(styles.intro, "inline-flex items-center gap-2")}>
          <BrandIcon className="size-8 shrink-0" aria-hidden="true" />
          <span className="text-base font-semibold">Code Atlas</span>
        </div>
        <h1
          id="home-title"
          className={cn(
            styles.intro,
            styles.introCopy,
            "max-w-4xl text-4xl leading-[1.06] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl",
          )}
        >
          Know the concept. <br />
          <span className="text-category-closures">Write the code.</span>
        </h1>
        <p
          className={cn(
            styles.intro,
            styles.introCopy,
            "max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8",
          )}
        >
          A focused place to think through JavaScript, solve real problems, and
          turn understanding into something you can actually write.
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className={cn(
            styles.startAction,
            styles.intro,
            styles.introAction,
            "h-12 w-full border border-input sm:w-52",
          )}
        >
          <Link href={startHref} prefetch={false}>
            Start practicing
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <section
        id="practice-preview"
        className={cn(styles.previewIntro, "min-w-0 scroll-mt-6")}
        aria-label="Try JavaScript without signing in"
      >
        <CounterPreview />
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-title"
        className={cn(
          styles.intro,
          styles.contentIntro,
          "flex scroll-mt-8 flex-col gap-8",
        )}
      >
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            A better practice loop
          </p>
          <h2
            id="how-title"
            className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
          >
            Less guessing. More understanding.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            A little structure around the most important part: figuring it out
            yourself.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {practiceSteps.map((step) => (
            <Card key={step.number}>
              <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                  <step.icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {step.number}
                  </span>
                </div>
                <CardTitle size="lg">
                  <h3>{step.title}</h3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
              <CardFooter className="mt-auto">
                <span className="text-xs text-muted-foreground">
                  {step.number === "01"
                    ? "Examples · Hints · Solutions"
                    : step.number === "02"
                      ? "Write · Run · Submit"
                      : "Flags · Saved code · Solved status"}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="subjects"
        aria-labelledby="subjects-title"
        className={cn(
          styles.intro,
          styles.contentIntro,
          "flex scroll-mt-8 flex-col gap-8",
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-xl flex-col gap-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Find your next problem
            </p>
            <h2
              id="subjects-title"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Subjects to explore
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Start with JavaScript. There is more on the map ahead.
            </p>
          </div>
          <Button asChild variant="link">
            <Link href="/dashboard" prefetch={false}>
              Go to dashboard
              <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card className="min-w-0">
            <CardHeader className="flex flex-col sm:grid">
              <CardTitle size="lg">
                <h3>{javascript?.title}</h3>
              </CardTitle>
              <CardDescription>{javascript?.description}</CardDescription>
              <CardAction>
                <Badge variant="amber">Available now</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="min-w-0">
              <p className="mb-3 text-xs text-muted-foreground">
                {published.length} problems · {topicCount} topics · one place to
                practice
              </p>
              <ul
                aria-label="Published JavaScript problems"
                className="flex flex-col"
              >
                {published.map((problem) => {
                  const topic = topics.find(
                    (item) => item.id === problem.topicId,
                  );
                  const Icon =
                    topicIcons[problem.topicId as keyof typeof topicIcons] ??
                    CodeXmlIcon;
                  return (
                    <li key={problem.id} className="border-b last:border-b-0">
                      <Link
                        href={`/javascript/practice/${problem.slug}`}
                        prefetch={false}
                        className="group flex min-w-0 items-center gap-3 rounded-md py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                      >
                        <Icon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-2">
                          <span className="text-sm font-medium group-hover:underline">
                            {problem.title}
                          </span>
                          <span className="flex flex-wrap items-center gap-2">
                            <DifficultyBadge difficulty={problem.difficulty} />
                            <Badge variant={topic?.variant}>
                              {topic?.label}
                            </Badge>
                          </span>
                        </span>
                        <ArrowUpRightIcon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/javascript/practice" prefetch={false}>
                  Browse JavaScript
                  <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {upcoming.map((subject) => (
              <Card key={subject.id} className="h-full">
                <CardHeader>
                  <CardTitle size="lg">
                    <h3>{subject.title}</h3>
                  </CardTitle>
                  <CardDescription>{subject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {subject.focus}
                  </p>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button variant="outline" disabled className="w-full">
                    Coming soon
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        className={cn(
          styles.intro,
          styles.contentIntro,
          "mx-auto flex w-full max-w-3xl flex-col gap-6",
        )}
        aria-labelledby="questions-title"
      >
        <h2
          id="questions-title"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          A few things to know.
        </h2>
        <Accordion type="single" collapsible>
          {landingQuestions.map((question) => (
            <AccordionItem key={question.id} value={question.id}>
              <AccordionTrigger>{question.question}</AccordionTrigger>
              <AccordionContent>{question.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section
        aria-labelledby="start-title"
        className={cn(
          styles.intro,
          styles.contentIntro,
          "flex flex-col items-center gap-5 rounded-xl border bg-card px-6 py-12 text-center sm:py-16",
        )}
      >
        <BrandIcon
          className="size-8 text-muted-foreground"
          aria-hidden="true"
        />
        <h2
          id="start-title"
          className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          One problem is a good place to start.
        </h2>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          Pick a challenge. Try a solution. Give yourself something to build on.
        </p>
        <Button asChild size="lg">
          <Link href="/javascript/practice/counter" prefetch={false}>
            Start with Counter
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t py-6 text-xs text-muted-foreground">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <BrandIcon className="size-4" aria-hidden="true" />
          Code Atlas
        </Link>
        <span>JavaScript first. More to explore.</span>
        <a
          href="#subjects"
          className="rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          Explore subjects
        </a>
      </footer>
    </main>
  );
}
