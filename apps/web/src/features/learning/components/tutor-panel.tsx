"use client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useWorkspaceTools } from "../state/workspace-tools";
export function TutorPanel() {
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
        <TabsContent value="tutor" className="p-5">
          <p className="mb-2 text-sm font-semibold">
            A little guidance, when you need it.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AI tutoring is coming soon. For now, use the lesson, checkpoint
            feedback, and guided walkthrough.
          </p>
        </TabsContent>
        <TabsContent value="notes" className="p-5">
          <p className="mb-2 text-sm font-semibold">
            Space for your own connections.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Saved notes are coming soon. There is nothing to save or sync yet.
          </p>
        </TabsContent>
      </Tabs>
    </section>
  );
}
