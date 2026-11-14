"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldTitle,
} from "@workspace/ui/components/field";
import { Skeleton } from "@workspace/ui/components/skeleton";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId } from "react";
import { useProblemNotes } from "../state/problem-notes";

const Editor = dynamic(() => import("./problem-notes-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-40 flex-1 flex-col gap-3" role="status">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="min-h-32 flex-1" />
      <span className="sr-only">Loading notes editor…</span>
    </div>
  ),
});

export function ProblemNotes() {
  const s = useProblemNotes();
  const title = useId(),
    description = useId();
  const { ensureLoaded } = s;
  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);
  const error = s.loadError ?? s.saveError;
  const status = !s.signedIn
    ? "Sign in to save notes across sessions."
    : s.phase === "idle" || s.phase === "loading"
      ? "Loading your notes…"
      : s.loadError
        ? "Notes could not be loaded."
        : s.saving
          ? "Saving…"
          : s.saveError
            ? "Not saved to account."
            : s.dirty
              ? "Unsaved changes."
              : s.saved.updatedAt
                ? `Saved ${new Date(s.saved.updatedAt).toLocaleString()}.`
                : "No saved notes yet.";
  return (
    <form
      aria-label="Problem notes"
      className="flex h-full min-h-0 flex-1 flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void s.save();
      }}
    >
      <FieldGroup className="min-h-0 flex-1 gap-3">
        <Field className="min-h-0 flex-1" data-disabled={s.phase !== "ready"}>
          <FieldTitle id={title}>Your notes</FieldTitle>
          {s.signedIn && s.phase === "ready" ? (
            <Editor
              content={s.draft}
              onChange={s.setDraft}
              labelId={title}
              descriptionId={description}
            />
          ) : s.signedIn && !s.loadError ? (
            <Skeleton className="min-h-40 flex-1" />
          ) : null}
        </Field>
        <FieldDescription id={description}>
          Save to keep notes with your account. Unsaved changes last until you
          leave or reload this problem.
        </FieldDescription>
      </FieldGroup>
      {error && <FieldError>{error.message}</FieldError>}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-xs text-muted-foreground">
          {status}
        </p>
        <div className="flex flex-wrap gap-2">
          {(!s.signedIn || error?.signIn) && (
            <Button asChild size="sm" variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
          {s.loadError && !s.loadError.signIn && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={s.retryLoad}
            >
              Retry loading notes
            </Button>
          )}
          {s.saveError && !s.saveError.signIn && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={s.saving}
              onClick={() => void s.save(true)}
            >
              Retry saving notes
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={
              !s.signedIn ||
              s.phase !== "ready" ||
              !s.dirty ||
              s.saving ||
              error?.signIn
            }
          >
            {s.saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
