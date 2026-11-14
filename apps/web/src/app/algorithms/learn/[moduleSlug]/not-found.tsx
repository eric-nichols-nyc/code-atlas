import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export default function ModuleNotFound() {
  return (
    <main className="flex min-w-0 flex-1 flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-semibold">Module unavailable</h1>
      <p className="text-sm text-muted-foreground">
        This module has not been published, or the address is incorrect.
      </p>
      <Button asChild>
        <Link href="/algorithms/learn">Back to Learn</Link>
      </Button>
    </main>
  );
}
