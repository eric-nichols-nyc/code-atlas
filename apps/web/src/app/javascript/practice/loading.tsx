import { Skeleton } from "@workspace/ui/components/skeleton";
export default function Loading() {
  return (
    <main
      className="flex flex-1 flex-col gap-5 p-6"
      aria-label="Loading JavaScript practice"
      aria-busy="true"
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-64 w-full" />
    </main>
  );
}
