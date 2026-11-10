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
import Link from "next/link";
import { subjects } from "@/features/catalog/data/subjects";
import { javascriptTopics } from "@/features/dashboard/data/topics";

export function DashboardContent() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-5 pt-6 pb-8 md:gap-10 md:px-6 md:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-9 font-semibold tracking-tight md:text-4xl md:leading-11">
          Your learning space
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Explore a subject, understand the ideas, and put them into practice.
        </p>
      </header>

      <section
        aria-labelledby="subjects-heading"
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="subjects-heading"
            className="text-[22px] leading-[30px] font-semibold"
          >
            Subjects to explore
          </h2>
          <p className="text-sm text-muted-foreground">
            Start with JavaScript. More paths are on the way.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {subjects.map((subject) => (
            <Card key={subject.id} className="gap-5 py-5 md:py-6">
              <CardHeader className="gap-y-3 px-5 md:px-6">
                <CardTitle size="lg">
                  <h3>{subject.title}</h3>
                </CardTitle>
                {subject.id === "javascript" && (
                  <CardAction className="row-span-1">
                    <Badge variant="secondary">Start here</Badge>
                  </CardAction>
                )}
                <CardDescription className="col-span-full">
                  {subject.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-wrap items-start gap-1.5 px-5 md:px-6">
                {subject.id === "javascript" ? (
                  javascriptTopics.map((topic) => (
                    <Badge key={topic.title} variant={topic.variant}>
                      {topic.title}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {subject.focus}
                  </p>
                )}
              </CardContent>
              <CardFooter className="px-5 md:px-6">
                {subject.id === "javascript" ? (
                  <Button asChild className="w-full">
                    <Link href="/javascript">Explore JavaScript</Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Coming soon
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
