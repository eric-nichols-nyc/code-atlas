import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
export default function ProblemNotFound() {
  return (
    <main className="flex flex-1 flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-semibold">Problem unavailable</h1>
      <p className="text-sm text-muted-foreground">
        This problem has not been published, or the address is incorrect.
      </p>
      <Button asChild>
        <Link href="/javascript/practice">All JavaScript problems</Link>
      </Button>
    </main>
  );
}
