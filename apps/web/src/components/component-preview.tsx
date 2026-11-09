"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

export function ComponentPreview() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Preview components</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shared UI, ready to use</DialogTitle>
          <DialogDescription>
            This dialog and its button come from the shared UI package. Changes
            there appear in both apps.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
