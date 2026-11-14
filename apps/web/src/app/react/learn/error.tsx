"use client";

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export default function LearningError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-w-0 flex-1 flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-semibold">React learning could not load.</h1>
      <p className="text-sm text-muted-foreground">
        Try again, or return to the learning catalog.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/react/learn">Back to Learn</Link>
        </Button>
      </div>
    </main>
  );
}
