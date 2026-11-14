import { LoaderCircleIcon } from "@workspace/ui/components/icons";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function RouteLoading({ label = "Loading page" }: { label?: string }) {
  return (
    <main
      className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-1 flex-col gap-5 px-5 py-8 md:px-8 md:py-14 lg:px-14"
      aria-label={label}
      aria-busy="true"
    >
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <LoaderCircleIcon
          aria-hidden="true"
          className="size-5 shrink-0 motion-safe:animate-spin"
        />
        <span>{label}…</span>
      </p>
      <div aria-hidden="true" className="flex min-w-0 flex-col gap-5">
        <Skeleton className="h-8 w-48 max-w-full motion-reduce:animate-none" />
        <Skeleton className="h-20 w-full motion-reduce:animate-none" />
        <Skeleton className="h-64 w-full motion-reduce:animate-none" />
      </div>
    </main>
  );
}
