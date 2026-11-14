import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import { staleClosureCounter as exercise } from "@/content/react/practice/stale-closure-counter/exercise";
import { DifficultyBadge } from "@/features/catalog/components/difficulty-badge";

export function ReactPracticeCatalog() {
  return (
    <main className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-col gap-8 px-5 pt-6 pb-8 md:px-8 md:pt-14 lg:px-14">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-[28px] leading-9 font-semibold tracking-tight md:text-[40px] md:leading-[50px]">
          React practice
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Build with components, state and hooks. Edit a draft, then select
          Submit to see it in the browser preview.
        </p>
        <Badge variant="secondary">Development pilot</Badge>
      </header>
      <section
        aria-labelledby="react-hooks-heading"
        className="flex flex-col gap-4"
      >
        <h2 id="react-hooks-heading" className="text-xl font-semibold">
          Hooks
        </h2>
        <Card className="max-w-2xl rounded-md shadow-none">
          <CardHeader>
            <CardTitle>
              <h3>{exercise.title}</h3>
            </CardTitle>
            <CardDescription>{exercise.statement}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <DifficultyBadge difficulty={exercise.difficulty} />
            <Badge variant="secondary">{exercise.topic}</Badge>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/react/practice/${exercise.slug}`}>
                Open exercise
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
      <p className="text-sm text-muted-foreground">
        Drafts and tutor chat last for this visit. This pilot has no judging or
        saved progress. React Learn is coming later.
      </p>
    </main>
  );
}
