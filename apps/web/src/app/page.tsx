import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import { subjects } from "@/features/catalog/data/subjects";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-20 px-5 py-16 md:px-6 md:py-24">
      <section
        aria-labelledby="home-title"
        className="flex max-w-3xl flex-col gap-6"
      >
        <p className="text-sm font-medium text-muted-foreground">
          Welcome to Code Atlas
        </p>
        <h1
          id="home-title"
          className="max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl"
        >
          Find your way through code.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          A space to learn JavaScript, practice problem solving, and explore the
          ideas behind great interfaces. One concept at a time.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard" prefetch={false}>
              Go to dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#subjects">Explore subjects</a>
          </Button>
        </div>
      </section>

      <section
        id="subjects"
        aria-labelledby="subjects-title"
        className="flex scroll-mt-8 flex-col gap-6 border-t pt-10"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="subjects-title"
            className="text-xl font-semibold tracking-tight"
          >
            Subjects to explore
          </h2>
          <p className="text-sm text-muted-foreground">
            Starting with JavaScript, with more paths to follow.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {subjects.map((subject) => (
            <Card key={subject.title}>
              <CardHeader>
                <CardTitle size="lg">
                  <h3>{subject.title}</h3>
                </CardTitle>
                <CardDescription>{subject.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Badge variant="secondary">Coming soon</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
