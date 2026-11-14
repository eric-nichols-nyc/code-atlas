"use client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import type { ReactNode } from "react";
import { useWorkspaceTools } from "../state/workspace-tools";
export function TutorPanel({
  notes,
  tutor,
}: {
  notes?: ReactNode;
  tutor?: ReactNode;
}) {
  const s = useWorkspaceTools();
  return (
    <section className="learning-panel h-full" aria-label="Learning tools">
      <Tabs
        value={s.tab}
        onValueChange={s.setTab}
        className="min-h-0 flex-1 gap-0"
      >
        <div className="learning-panel-header">
          <TabsList variant="line">
            <TabsTrigger value="tutor">AI tutor</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="tutor" className="min-h-0 overflow-hidden">
          {tutor ?? (
            <p className="p-5 text-sm text-muted-foreground">
              Open a practice problem to ask about your code.
            </p>
          )}
        </TabsContent>
        <TabsContent value="notes" className="min-h-0 overflow-hidden p-3">
          {notes}
        </TabsContent>
      </Tabs>
    </section>
  );
}
